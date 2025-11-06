// src/lib/ai-services.js
import { AI_PROVIDERS, AI_MODELS, AI_ENDPOINTS } from './ai-config';

export class EmailGenerationService {
  constructor(provider, apiKey) {
    this.provider = provider;
    this.apiKey = apiKey;
  }

  // Enhanced JSON cleaning method
  cleanJsonResponse(response) {
    let content = response.trim();
    
    // Remove markdown code blocks if present
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Remove any trailing incomplete JSON structures
    content = content.replace(/}\s*"\s*}\s*}\s*$/, '}');
    content = content.replace(/}\s*}\s*$/, '}');
    
    // Ensure proper JSON structure
    content = content.trim();
    if (!content.startsWith('{')) {
      content = '{' + content;
    }
    if (!content.endsWith('}')) {
      content = content + '}';
    }
    
    return content;
  }

  async generateEmail(prompt) {
    let response;
    
    response = await this.generateWithGemini(prompt);

    // Enhanced JSON parsing for all responses
    try {
      // First, clean the response
      const cleanedResponse = this.cleanJsonResponse(response);
      // console.log('Cleaned response:', cleanedResponse);
      
      const jsonResponse = JSON.parse(cleanedResponse);
      
      if (!jsonResponse.subject || !jsonResponse.body) {
        throw new Error('Invalid response format: missing subject or body');
      }
      
      return jsonResponse;
      
    } catch (parseError) {
      console.log('JSON parse failed:', parseError.message);
      console.log('Raw response:', response);
      
      // Try to fix incomplete JSON
      let fixedResponse = response.trim();
      
      // Remove markdown formatting
      fixedResponse = this.cleanJsonResponse(fixedResponse);
      
      // Handle case where JSON is cut off in the middle of body field
      if (fixedResponse.includes('"body": "') && !fixedResponse.endsWith('"}')) {
        // Find the last complete part and close the JSON
        const bodyStart = fixedResponse.indexOf('"body": "') + 9;
        const currentBody = fixedResponse.substring(bodyStart);
        
        // Remove any trailing incomplete characters
        const cleanBody = currentBody.replace(/[^a-zA-Z0-9\s.,!?;:'"()-]*$/, '');
        
        fixedResponse = fixedResponse.substring(0, bodyStart) + cleanBody + '"}';
      }
      
      // Try parsing the fixed response
      try {
        const jsonResponse = JSON.parse(fixedResponse);
        if (jsonResponse.subject && jsonResponse.body) {
          return jsonResponse;
        }
      } catch (fixError) {
        console.log('Fixed JSON parse also failed:', fixError.message);
      }
      
      // Fallback: try to extract JSON from response if it's wrapped in other text
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const cleanedMatch = this.cleanJsonResponse(jsonMatch[0]);
          const jsonResponse = JSON.parse(cleanedMatch);
          if (jsonResponse.subject && jsonResponse.body) {
            return jsonResponse;
          }
        } catch (e) {
          console.log('JSON match parse failed:', e.message);
        }
      }
      
      // Final fallback: return a structured object with whatever we got
      return {
        subject: 'Email Subject (Generated with Issues)',
        body: response || 'Email generation encountered an issue. Please try again.'
      };
    }
  }

  async generateWithGemini(prompt) {
    const response = await fetch(AI_ENDPOINTS[AI_PROVIDERS.GEMINI], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: AI_MODELS[AI_PROVIDERS.GEMINI],
        messages: [
          {
            role: 'system',
            content: 'You are an expert email writing assistant. Write professional, clear, and engaging emails based on the user\'s requirements. Return ONLY a valid JSON object with "subject" and "body" fields. Do not include any markdown formatting or extra characters.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        top_p: 0.7,
        frequency_penalty: 1,
        top_k: 50
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
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
  ${formData.senderName ? `8. End with an appropriate closing and sign with "${formData.senderName}"` : '8. End with an appropriate closing phrase (like "Best regards," or "Thank you,") without a signature name'}

  Critical: Return ONLY a valid JSON object with no markdown, no code blocks, no explanations:
  {
    "subject": "Your email subject here",
    "body": "Your complete email body here"
  }`;
};