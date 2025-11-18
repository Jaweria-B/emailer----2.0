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

    // console.log('Raw AI Response:', textResponse);

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

    // Return the properly structured response
    return NextResponse.json({
      subject: parsedResponse.subject,
      email: parsedResponse.body, // Note: your code uses 'email' not 'body'
      has_branding: false
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