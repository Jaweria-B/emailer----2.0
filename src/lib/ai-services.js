// src/lib/ai-services.js
import { AI_PROVIDERS, AI_MODELS, AI_ENDPOINTS } from './ai-config';
import { GoogleGenAI } from '@google/genai';
export class EmailGenerationService {
  constructor(provider, apiKey) {
    this.provider = provider;
    this.apiKey = apiKey;
    this.maxRetries = 3;
    this.retryDelay = 2000; // 2 seconds
  }

  // Sleep utility for retry delays
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
    let lastError = null;
    
    // Retry loop for handling temporary failures
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`Email generation attempt ${attempt}/${this.maxRetries}`);
        
        const response = await this.generateWithGemini(prompt);

        // Enhanced JSON parsing
        try {
          const cleanedResponse = this.cleanJsonResponse(response);
          const jsonResponse = JSON.parse(cleanedResponse);
          
          if (!jsonResponse.subject || !jsonResponse.body) {
            throw new Error('Invalid response format: missing subject or body');
          }
          
          console.log('✅ Email generated successfully');
          return jsonResponse;
          
        } catch (parseError) {
          console.log('JSON parse attempt failed:', parseError.message);
          
          // Try to fix incomplete JSON
          const fixedResponse = this.attemptJsonFix(response);
          if (fixedResponse) {
            console.log('✅ Email generated with JSON repair');
            return fixedResponse;
          }
          
          // If this is the last attempt, throw parse error
          if (attempt === this.maxRetries) {
            throw new Error('Failed to parse AI response after multiple attempts');
          }
        }
        
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error.message);
        lastError = error;
        
        // Check if it's a retryable error
        if (this.isRetryableError(error)) {
          if (attempt < this.maxRetries) {
            console.log(`Retrying in ${this.retryDelay}ms...`);
            await this.sleep(this.retryDelay);
            continue; // Retry
          }
        } else {
          // Non-retryable error, throw immediately
          throw error;
        }
      }
    }
    
    // All retries exhausted
    throw lastError || new Error('Email generation failed after multiple attempts');
  }

  // Check if error is retryable (503, 429, network errors)
  isRetryableError(error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('503') ||
      message.includes('overloaded') ||
      message.includes('unavailable') ||
      message.includes('429') ||
      message.includes('rate limit') ||
      message.includes('timeout') ||
      message.includes('network')
    );
  }

  // Attempt to fix malformed JSON
  attemptJsonFix(response) {
    try {
      let fixedResponse = response.trim();
      fixedResponse = this.cleanJsonResponse(fixedResponse);
      
      // Handle case where JSON is cut off in the middle of body field
      if (fixedResponse.includes('"body": "') && !fixedResponse.endsWith('"}')) {
        const bodyStart = fixedResponse.indexOf('"body": "') + 9;
        const currentBody = fixedResponse.substring(bodyStart);
        const cleanBody = currentBody.replace(/[^a-zA-Z0-9\s.,!?;:'"()-]*$/, '');
        fixedResponse = fixedResponse.substring(0, bodyStart) + cleanBody + '"}';
      }
      
      const jsonResponse = JSON.parse(fixedResponse);
      if (jsonResponse.subject && jsonResponse.body) {
        return jsonResponse;
      }
      
      // Try extracting JSON from wrapped text
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const cleanedMatch = this.cleanJsonResponse(jsonMatch[0]);
        const extracted = JSON.parse(cleanedMatch);
        if (extracted.subject && extracted.body) {
          return extracted;
        }
      }
      
      return null;
    } catch (e) {
      return null;
    }
  }



async generateWithGemini(prompt) {
  const ai = new GoogleGenAI({ apiKey: this.apiKey });

  const response = await ai.models.generateContent({
    model: AI_MODELS[this.provider],
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `You are an expert email writing assistant. Write professional, clear, and engaging emails based on the user's requirements.

${prompt}

CRITICAL: Return ONLY a valid JSON object with "subject" and "body" fields. Do not include any markdown formatting, code blocks, or extra text. Just the raw JSON object.

Example format:
{"subject": "Your subject here", "body": "Your email body here"}`
          }
        ]
      }
    ],
    config: {
      temperature: 0.7,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json'
    }
  });

  const textResponse = response.text || JSON.stringify(response.response);

  return textResponse;
}


}

// Build priority-specific instruction
const getPriorityInstruction = (priority) => {
  switch (priority) {
    case 'urgent':
      return 'This is an URGENT matter - convey time-sensitivity professionally without being pushy or aggressive.';
    case 'high':
      return 'This is a high-priority matter - communicate importance clearly while maintaining professionalism.';
    case 'low':
      return 'This is a low-priority matter - keep the tone relaxed and non-pressing.';
    case 'normal':
    default:
      return 'This is a standard communication - maintain appropriate professional tone.';
  }
};

// Build purpose-specific instruction
const getPurposeInstruction = (purpose) => {
  switch (purpose) {
    case 'request':
      return 'Clearly state your request and explain why it matters. Make it easy for the recipient to say yes.';
    case 'follow-up':
      return 'Reference the previous communication and provide a gentle reminder or update.';
    case 'thank-you':
      return 'Express genuine gratitude and specify what you are thankful for.';
    case 'apology':
      return 'Take responsibility sincerely, acknowledge the impact, and offer a solution if applicable.';
    case 'invitation':
      return 'Provide clear details (what, when, where, why) and make the recipient feel welcomed.';
    case 'complaint':
      return 'State the issue clearly and professionally, provide context, and suggest a resolution.';
    case 'proposal':
      return 'Present your idea compellingly with clear benefits and a call to action.';
    case 'general':
    default:
      return 'Communicate your message clearly and ensure all key points are covered.';
  }
};

// Build length-specific instruction
const getLengthInstruction = (length) => {
  switch (length) {
    case 'short':
      return 'Keep it concise - 1 to 2 short paragraphs maximum. Get to the point quickly.';
    case 'long':
      return 'Write a comprehensive email with 5 or more paragraphs. Provide thorough details and context.';
    case 'medium':
    default:
      return 'Write a balanced email with 3 to 4 paragraphs. Cover all necessary points without being too brief or verbose.';
  }
};

// Build relationship-specific instruction
const getRelationshipInstruction = (relationship) => {
  switch (relationship) {
    case 'client':
      return 'Use a professional, service-oriented tone. Show respect and attentiveness to their needs.';
    case 'manager':
      return 'Be respectful and professional. Show competence and accountability in your communication.';
    case 'friend':
      return 'Use a warm, friendly tone while still maintaining appropriate professionalism for email.';
    case 'unknown':
      return 'Use a polite, professional first-contact tone. Introduce yourself clearly if appropriate.';
    case 'professional':
    default:
      return 'Maintain professional colleague-level formality - respectful but not overly formal.';
  }
};

// Build tone-specific instruction
const getToneInstruction = (tone) => {
  switch (tone) {
    case 'friendly':
      return 'Use a warm, approachable tone with friendly language while remaining professional.';
    case 'formal':
      return 'Use formal business language with proper structure and professional distance.';
    case 'warm':
      return 'Use empathetic, personable language that shows genuine care and connection.';
    case 'concise':
      return 'Be direct and to-the-point. Use short sentences and eliminate unnecessary words.';
    case 'enthusiastic':
      return 'Show genuine excitement and positive energy while maintaining professionalism.';
    case 'professional':
    default:
      return 'Use clear, professional business language - polished but not overly stiff.';
  }
};

export const createPrompt = (formData) => {
  return `You are an expert email writer. Transform the following raw thoughts into a polished, professional email.

RAW THOUGHTS: ${formData.rawThoughts}

EMAIL REQUIREMENTS:
${formData.recipient ? `- Recipient: ${formData.recipient}` : '- Recipient: Not specified (address generally)'}
${formData.senderName ? `- Sender name: ${formData.senderName}` : '- Sender name: Not specified (use appropriate generic closing)'}
${formData.subject ? `- Subject context: ${formData.subject}` : '- Subject: Create an appropriate subject line'}
${formData.context ? `- Additional context: ${formData.context}` : ''}
${formData.replyingTo ? `- This is a reply to the following email:\n${formData.replyingTo}` : ''}

WRITING INSTRUCTIONS:

1. TONE: ${getToneInstruction(formData.tone)}

2. RELATIONSHIP: ${getRelationshipInstruction(formData.relationship)}

3. PURPOSE: ${getPurposeInstruction(formData.purpose)}

4. PRIORITY: ${getPriorityInstruction(formData.priority)}

5. LENGTH: ${getLengthInstruction(formData.length)}

6. SUBJECT LINE: Create a clear, compelling subject line that accurately captures the email's purpose and content.

7. NATURAL WRITING: 
   - Write naturally and conversationally within the specified tone
   - NO placeholders like [Name], [Date], [Company], etc.
   - NO template markers or brackets
   - NO instructions to "insert" or "add" information
   - If specific information is missing, write around it gracefully or use general phrasing
   - Make the email feel complete and ready to send as-is

8. SIGNATURE: ${formData.senderName ? `End with an appropriate closing phrase and sign with the name "${formData.senderName}"` : 'End with an appropriate closing phrase like "Best regards," or "Thank you," but do NOT include a signature name since none was provided'}

9. STRUCTURE: 
   - Use proper email formatting with clear paragraphs
   - Include appropriate greeting if needed
   - Ensure logical flow from opening to closing
   - Make the message scannable and easy to read`;
};