// app/api/ai/generate-bulk-emails/route.js
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { sessionDb, checkEmailLimit, emailUsageDb } from '@/lib/database';

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
    const limitCheck = await checkEmailLimit(user.id, 'personalized');
    
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { 
          error: limitCheck.reason || 'Personalized email generation limit reached',
          limit: limitCheck.limit,
          used: limitCheck.used,
          remaining: 0,
          upgrade_required: true,
          limit_type: 'personalized'
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
                "email": "The full email body"
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

    const responseText = response.text;
    
    try {
      const parsedResponse = JSON.parse(responseText);
      
      // Validate response structure
      if (!parsedResponse.subject || !parsedResponse.email) {
        throw new Error('Invalid response structure');
      }

      // 6. ADD BRANDING IF REQUIRED (Free plan)
      let emailBody = parsedResponse.email;
      if (limitCheck.has_branding) {
        emailBody = emailBody + '\n\n---\nPowered by OpenPromote ⚡';
      }

      // 7. TRACK USAGE - INCREMENT PERSONALIZED EMAIL COUNT
      try {
        await emailUsageDb.incrementPersonalized(user.id, 1);
      } catch (error) {
        console.error('Failed to track personalized email usage:', error);
        // Don't fail the request if usage tracking fails
      }

      // 8. RETURN SUCCESS RESPONSE
      return NextResponse.json({
        success: true,
        subject: parsedResponse.subject,
        email: emailBody,
        has_branding: limitCheck.has_branding,
        usage: {
          remaining: Math.max(0, limitCheck.remaining - 1) // Subtract 1 since we just used one
        },
        usage_metadata: {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0
        }
      });

    } catch (parseError) {
      // FALLBACK: Try to extract subject and body manually
      const lines = responseText.split('\n').filter(line => line.trim());
      let subject = 'Personalized Outreach';
      let email = responseText;

      const subjectLine = lines.find(line => 
        line.toLowerCase().includes('subject:') || 
        line.toLowerCase().includes('subject line:')
      );
      
      if (subjectLine) {
        subject = subjectLine.replace(/subject:?\s*/i, '').trim();
        email = responseText.replace(subjectLine, '').trim();
      }

      // Add branding if required
      if (limitCheck.has_branding) {
        email = email + '\n\n---\nPowered by OpenPromote ⚡';
      }

      // Track usage
      try {
        await emailUsageDb.incrementPersonalized(user.id, 1);
      } catch (error) {
        console.error('Failed to track personalized email usage:', error);
      }

      return NextResponse.json({
        success: true,
        subject,
        email,
        has_branding: limitCheck.has_branding,
        usage: {
          remaining: Math.max(0, limitCheck.remaining - 1)
        },
        usage_metadata: {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0
        },
        fallbackParsing: true
      });
    }

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