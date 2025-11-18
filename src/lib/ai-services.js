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
