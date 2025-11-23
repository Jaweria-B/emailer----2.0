// app/api/ai/generate-bulk-emails/route.js
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { sessionDb, checkEmailLimit, emailUsageDb, userSubscriptionsDb, walletDb } from '@/lib/database';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  try {
    // 1. AUTHENTICATION CHECK
    const sessionToken = request.cookies.get('session_token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { 
          error: 'Authentication required. Please sign in to use personalized email generation.',
          auth_required: true
        },
        { status: 401 }
      );
    }

    // Verify session and get user
    const user = await sessionDb.findValid(sessionToken);
    
    if (!user) {
      return NextResponse.json(
        { 
          error: 'Invalid or expired session. Please sign in again.',
          auth_required: true
        },
        { status: 401 }
      );
    }

    // 2. CHECK SUBSCRIPTION LIMITS
    const limitCheck = await checkEmailLimit(user.id, 'generation');
    
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { 
          error: limitCheck.reason || 'Email generation limit reached',
          limit: limitCheck.limit,
          remaining: 0,
          upgrade_required: true
        },
        { status: 403 }
      );
    }

    // 3. PARSE REQUEST BODY
    const { systemPrompt, userPrompt, temperature = 0.7, maxTokens = 500 } = await request.json();

    if (!systemPrompt || !userPrompt) {
      return NextResponse.json({ error: 'Missing required prompts' }, { status: 400 });
    }

    // 4. CHECK FOR API KEY
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: 'Gemini API key not configured on server' 
      }, { status: 500 });
    }

    // 5. GENERATE EMAIL WITH GEMINI
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: [
        {
          role: 'user',
          parts: [
            { 
              text: `${systemPrompt}\n\nIMPORTANT: Format your response as a JSON object with the following structure:
              {
                "subject": "The email subject line",
                "body": "The full email body"
              }

              User Request: ${userPrompt}` 
            }
          ]
        }
      ],
      config: {
        temperature: parseFloat(temperature),
        maxOutputTokens: parseInt(maxTokens),
        responseMimeType: 'application/json',
        thinkingConfig: {
          thinkingBudget: 0
        }
      }
    });

    let textResponse = response.text || JSON.stringify(response.response);

    // Clean the response - remove markdown code blocks if present
    textResponse = textResponse.trim();
    if (textResponse.startsWith('```json')) {
      textResponse = textResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (textResponse.startsWith('```')) {
      textResponse = textResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Parse the JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(textResponse);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Failed to parse:', textResponse);
      
      // Try to extract JSON from the response
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } catch (e) {
          throw new Error('Could not parse AI response as valid JSON');
        }
      } else {
        throw new Error('No JSON found in AI response');
      }
    }

    // Validate the response has required fields
    if (!parsedResponse.subject || !parsedResponse.body) {
      console.error('Invalid response structure:', parsedResponse);
      throw new Error('AI response missing required fields (subject or body)');
    }

    // 6. ADD BRANDING IF REQUIRED
    let emailBody = parsedResponse.body;
    if (limitCheck.has_branding) {
      emailBody = emailBody + '\n\n---\nPowered by OpenPromote ⚡';
    }

    // 7. TRACK USAGE
    try {
      const subscription = await userSubscriptionsDb.getCurrent(user.id);
      
      if (subscription.plan_name === 'Free') {
        // Free plan: Increment generation count
        await emailUsageDb.incrementGeneration(user.id);
      } else if (subscription.plan_name === 'Pro') {
        // Pro plan: Deduct from wallet
        await walletDb.deduct(
          user.id,
          subscription.price_per_generation,
          'generation',
          `Bulk generated: ${parsedResponse.subject}`
        );
        
        // Track spending
        await sql`
          UPDATE email_usage
          SET total_spent = total_spent + ${subscription.price_per_generation},
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ${user.id} 
            AND period_start <= NOW() 
            AND period_end >= NOW()
        `;
      }
    } catch (trackingError) {
      console.error('Failed to track usage:', trackingError);
      // Don't fail the request if tracking fails
    }

    // 8. Return the properly structured response
    return NextResponse.json({
      subject: parsedResponse.subject,
      email: emailBody,
      has_branding: limitCheck.has_branding,
      usage: {
        remaining: Math.max(0, limitCheck.remaining - (limitCheck.cost || 1))
      }
    });
    
  } catch (error) {
    console.error('Bulk email generation error:', error);
    
    // Handle specific Gemini API errors
    if (error.message?.includes('API key')) {
      return NextResponse.json({ 
        error: 'Invalid Gemini API key' 
      }, { status: 401 });
    }

    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      return NextResponse.json({ 
        error: 'Gemini API quota exceeded or rate limit reached. Please try again later.' 
      }, { status: 429 });
    }

    if (error.message?.includes('SAFETY')) {
      return NextResponse.json({ 
        error: 'Content was blocked by safety filters. Please modify your prompt.' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Failed to generate email',
      details: error.message 
    }, { status: 500 });
  }
}