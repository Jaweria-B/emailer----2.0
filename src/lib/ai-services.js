// src/lib/ai-services.js
import { AI_PROVIDERS, AI_MODELS, AI_ENDPOINTS } from './ai-config';

export class EmailGenerationService {
  constructor(provider, apiKey) {
    this.provider = provider;
    this.apiKey = apiKey;
  }

  async generateEmail(prompt) {
    const response = await this.generateWithGemini(prompt);
    return response;
  }

  async generateWithGemini(prompt) {
    const model = AI_MODELS[AI_PROVIDERS.GEMINI];
    const endpoint = `${AI_ENDPOINTS[AI_PROVIDERS.GEMINI]}/${model}:generateContent`;

    // Define JSON schema for email response
    const responseSchema = {
      type: "object",
      properties: {
        subject: {
          type: "string",
          description: "Email subject line"
        },
        body: {
          type: "string",
          description: "Complete email body text"
        }
      },
      required: ["subject", "body"]
    };

    // Prepare request body following official Gemini REST API format
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        // Log the actual error for debugging
        const errorText = await response.text();
        console.error(`Gemini API error: ${response.status} - ${errorText}`);
        
        // Throw a user-friendly error
        throw new Error('AI service temporarily unavailable');
      }

      const data = await response.json();
      
      // Extract the text response from Gemini API response structure
      const textResponse = data.candidates[0].content.parts[0].text;
      
      // Parse the JSON response
      const jsonResponse = JSON.parse(textResponse);
      
      // Validate response structure
      if (!jsonResponse.subject || !jsonResponse.body) {
        throw new Error('Invalid response format: missing subject or body');
      }
      
      return jsonResponse;
      
    } catch (error) {
      // Log the actual error for debugging
      console.error('Error generating email with Gemini:', error);
      
      // Return user-friendly fallback
      throw new Error('Unable to generate email at this time');
    }
  }
}
export const createPrompt = (formData) => {
  return `You are an expert email writer. Transform the following raw thoughts into a polished, professional email.

Raw thoughts: ${formData.rawThoughts}

Email Requirements:
- Tone: ${formData.tone}
${formData.recipient ? `- Recipient: ${formData.recipient}` : ''}
${formData.senderName ? `- Sign off with: ${formData.senderName}` : '- Use an appropriate sign-off without a specific name'}
${formData.subject ? `- Subject context: ${formData.subject}` : ''}
- Relationship with recipient: ${formData.relationship}
- Email purpose: ${formData.purpose}
- Priority level: ${formData.priority}
- Desired length: ${formData.length}
${formData.context ? `- Additional context: ${formData.context}` : ''}
${formData.replyingTo ? `- This is a reply to: ${formData.replyingTo}` : ''}

Instructions:
1. Write a ${formData.tone} email that is ${formData.length} in length
2. Match the tone and formality to the ${formData.relationship} relationship
3. Ensure the email clearly addresses the ${formData.purpose}
${formData.priority === 'urgent' ? '4. Convey urgency appropriately without being pushy' : formData.priority === 'high' ? '4. Communicate the high priority professionally' : ''}
4. Create a clear, compelling subject line that accurately reflects the email content
5. Write naturally - NO placeholders, NO brackets, NO template markers like [Name] or [Date]
6. If information is missing, write around it gracefully - use context clues or general phrasing
7. Make the email feel complete and ready to send as-is
8. Format the email body with proper paragraphs separated by double line breaks (\\n\\n)
9. Use single line breaks (\\n) within paragraphs where natural
${formData.senderName ? `10. End with an appropriate closing and sign with "${formData.senderName}"` : '10. End with an appropriate closing phrase (like "Best regards," or "Thank you,") without a signature name'}

IMPORTANT: In the email body, use \\n\\n to separate paragraphs and \\n for line breaks within the email structure (greeting, body paragraphs, closing, signature should each be on separate lines).

Return your response as a JSON object with exactly two fields:
- "subject": A clear, compelling subject line
- "body": The complete email body with proper line breaks using \\n for single breaks and \\n\\n for paragraph separations`;
};