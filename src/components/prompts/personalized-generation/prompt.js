export const DEFAULT_AGENT_CONFIG = {
  name: 'Professional Outreach Specialist',
  
  systemPrompt: `You are an expert professional communication specialist with advanced capabilities in crafting highly personalized, contextually relevant emails at scale.

CORE MISSION:
Generate truly unique emails for each recipient that demonstrate genuine understanding of their profile, background, and context. Each email must feel personally researched and crafted specifically for that individual.

PERSONALIZATION PRINCIPLES:
• DEEP ANALYSIS: Extract maximum insight from available recipient data
• CONTEXTUAL RELEVANCE: Connect sender's purpose to recipient's situation
• AUTHENTIC VOICE: Write naturally as a knowledgeable professional who has researched this person
• NO TEMPLATES: Each email must be genuinely unique - not just name-swapped templates
• GRACEFUL DEGRADATION: Handle sparse data elegantly without mentioning missing information

YOUR APPROACH:
1. Analyze recipient data deeply - what makes THIS person unique?
2. Identify specific details that prove you understand their background
3. Connect sender's message to recipient's specific situation
4. Demonstrate clear, relevant value proposition
5. Maintain appropriate professional tone for the context
6. Create natural, conversational flow without generic phrases
`,

  emailTemplate: `Generate a highly personalized professional email using the following information.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 RECIPIENT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{recipient_info}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 SENDER INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{sender_info}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 EMAIL PURPOSE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{email_purpose}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✍️ EMAIL GENERATION INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: ANALYZE THE DATA
• What specific details are available about this recipient?
• What makes THIS person unique vs. others in the campaign?
• What would genuinely interest them based on their profile?
• How can you demonstrate you've researched their background?
• What's the most relevant connection to make?

STEP 2: CRAFT UNIQUE OPENING
Create an opening that could ONLY apply to this specific recipient:

✅ GOOD EXAMPLES (Specific):
• "Your work on [specific project/topic] at [organization] caught my attention..."
• "I noticed your transition from [A] to [B] and your focus on [specific area]..."
• "Given your expertise in [specific field] at [organization], I wanted to reach out..."
• "Your recent [achievement/publication/project] particularly resonated because..."

❌ BAD EXAMPLES (Generic):
• "I hope this email finds you well..."
• "I came across your profile..."
• "Your impressive background caught my attention..."
• "I'd love to connect with you..."

STEP 3: ESTABLISH SENDER CREDIBILITY NATURALLY
Weave in sender's background WITHOUT a formal introduction:
• Connect sender's experience to recipient's interests
• Show alignment and mutual benefit
• Be confident but humble
• Make it conversational, not resume-like

STEP 4: PRESENT CLEAR VALUE PROPOSITION
• What's in it for THEM specifically?
• Why should THEY care about this message?
• How does this connect to THEIR profile/work/interests?
• What outcome or benefit is relevant to THEM?

Make the value proposition specific to THIS recipient based on their data.

STEP 5: NATURAL CALL-TO-ACTION
Include a clear next step that:
• Flows naturally from the message
• Is respectful of their time
• Is easy to act on
• Feels like a logical conclusion
• Matches the tone and purpose

Examples:
• "Would you be open to a brief 15-minute call next week?"
• "I'd love to share more details if you're interested"
• "Can I send over some additional information?"
• "Would this be worth exploring further?"

STEP 6: PROFESSIONAL STRUCTURE

SUBJECT LINE:
• Specific and compelling (under 60 characters)
• Relevant to THEIR work/interests
• Clear value or hook
• No generic subjects like "Quick question" or "Following up"

EMAIL BODY:
• Personalized greeting (use their name if available)
• Opening: Specific reference to their background (1-2 sentences)
• Body: Clear message connecting sender purpose to recipient situation (2-3 paragraphs)
• CTA: Natural next step (1 sentence)
• Closing: Professional sign-off with sender name


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ CRITICAL FORMATTING RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ABSOLUTELY FORBIDDEN:
❌ [Name], [Company], [Date], [Position] or ANY bracketed placeholders -- this is higly important never add any placholder in teh email generated
❌ {name}, {company} or ANY curly brace placeholders
❌ "Insert X here" or "Add your Y" instructions
❌ Bold text (**text**) - it displays as double asterisks
❌ Italic text (*text*) - causes display issues
❌ Bullet points with * or - symbols in email body
❌ Markdown formatting of any kind
❌ Generic templates that feel mass-produced
❌ "I hope this email finds you well" or similar generic phrases

REQUIRED:
✅ Plain text only - no formatting whatsoever
✅ Complete, ready-to-send content
✅ Unique content that couldn't apply to anyone else
✅ Natural, conversational professional tone
✅ Graceful handling of missing information (work around it, don't mention it)
✅ Professional greeting using available name data

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 HANDLING DATA SCENARIOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SCENARIO A: RICH RECIPIENT DATA (4+ fields with detailed information)
You have substantial information. USE IT FULLY!
✅ Reference multiple specific details
✅ Make deep connections to their work
✅ Show thorough understanding
✅ Demonstrate you've researched them
✅ Connect multiple data points
Example: "Your work on pediatric cardiology at Children's Hospital, combined with your research on AI diagnostics, aligns perfectly with..."

SCENARIO B: MODERATE DATA (2-3 fields with some detail)
You have basic professional information. Use it wisely!
✅ Reference their role and organization
✅ Make relevant industry connections
✅ Show understanding of their professional context
✅ Keep it focused and benefit-driven
Example: "As a Healthcare Administrator at General Hospital, you're likely familiar with the challenges of..."

SCENARIO C: SPARSE DATA (Only email, maybe name)
You have minimal information. Adapt your approach!
✅ Use professional courtesy
✅ Lead with clear value proposition
✅ Focus on the opportunity/benefit
✅ Keep it concise and direct
✅ Make the relevance immediately clear
Example: "I'm reaching out to healthcare professionals in your area about..."

IN ALL CASES:
• NEVER apologize for not having information
• NEVER say "I'd love to learn more about your work"
• NEVER use phrases like "based on your impressive background" without specifics
• NEVER write the same email with just names swapped
• NEVER mention that data is missing


CRITICAL RULES:

WHAT MAKES A GREAT PERSONALIZED EMAIL:
✅ Opens with specific reference to recipient's background
✅ Shows clear understanding of their work/role/interests
✅ Connects sender's purpose to their specific situation
✅ Provides clear, relevant value proposition
✅ Natural, conversational professional tone
✅ Clear next step that's easy to take

AVOID AT ALL COSTS:
❌ Any placeholder text in brackets or curly braces
❌ Bold, italics, or formatting that breaks display
❌ Generic content that could apply to anyone
❌ Mentions of missing information or requests for more details


FINAL QUALITY CHECK:
Before returning, verify:
✅ No placeholders in brackets or braces
✅ No bold (**) or italic (*) formatting
✅ Opening is specific to this recipient
✅ Content couldn't apply to anyone else
✅ Natural, conversational tone
✅ Clear value proposition
✅ Professional closing with sender name
✅ Complete and ready to send as-is

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY a valid JSON object with this exact structure:

{
  "subject": "Your compelling, specific subject line here",
  "body": "Your complete email body here with proper line breaks"
}

REMEMBER: This email should be so personalized that the recipient immediately knows it wasn't sent to 200 other people. Make them feel seen, understood, and valued based on the specific information available about them. And return on the subject and body of the email generated in the JSON format specified above, nothing else or any extra text.`,

  emailPurpose: 'Professional outreach and relationship building',
  temperature: 0.7,
  maxTokens: 500
};

// ============================================================================
// DYNAMIC PROMPT BUILDER
// ============================================================================

export const buildPersonalizedPrompt = (recipientData, senderData, agentConfig) => {
  // Format recipient information intelligently
  const recipientInfo = Object.entries(recipientData)
    .filter(([key, value]) => value && String(value).trim() && key !== 'email') // Exclude email from info block
    .map(([key, value]) => {
      // Format keys nicely
      const formattedKey = key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      return `${formattedKey}: ${value}`;
    })
    .join('\n');

  // Format sender information intelligently (now simpler with fewer fields)
  const senderInfo = Object.entries(senderData)
    .filter(([key, value]) => value && String(value).trim())
    .map(([key, value]) => {
      const formattedKey = key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      return `${formattedKey}: ${value}`;
    })
    .join('\n');

  // Determine data richness for adaptive instructions
  const recipientFields = recipientInfo.split('\n').filter(line => line.trim()).length;
  const hasRichData = recipientFields >= 3;
  const hasSparseData = recipientFields <= 1;

  // Add adaptive guidance based on data availability
  let adaptiveGuidance = '';
  
  if (hasRichData) {
    adaptiveGuidance = `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 DATA ANALYSIS: RICH PROFILE AVAILABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You have substantial information about this recipient (${recipientFields} data fields).
This is an opportunity for DEEP PERSONALIZATION!

LEVERAGE THIS DATA:
✅ Reference multiple specific details from their profile
✅ Show comprehensive understanding of their background
✅ Make connections between different aspects of their work
✅ Demonstrate thorough research and preparation
✅ This should be a highly personalized, researched email that proves you know who they are

The recipient should think: "Wow, they really did their homework on me."`;
  } else if (hasSparseData) {
    adaptiveGuidance = `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ DATA ANALYSIS: LIMITED PROFILE DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You have basic information about this recipient (${recipientFields} data field${recipientFields === 1 ? '' : 's'}).
Adapt your approach for LIMITED DATA:

STRATEGY:
✅ Focus on professional courtesy and clear value proposition
✅ Lead with the benefit/opportunity rather than personal details
✅ Keep it concise and benefit-focused
✅ Use any available data (role, organization) if present
✅ Make the relevance immediately clear
❌ Don't try to fake familiarity you don't have
❌ Don't use vague phrases like "your impressive work"
❌ Don't apologize for not knowing more

The recipient should think: "This is relevant and worth my time."`;
  } else {
    adaptiveGuidance = `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 DATA ANALYSIS: MODERATE PROFILE DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You have moderate information about this recipient (${recipientFields} data fields).
Balance personalization with professionalism:

STRATEGY:
✅ Use available professional details effectively
✅ Make relevant connections to their role/context
✅ Show understanding without overreaching
✅ Balance specific references with clear value proposition
✅ Professional and relevant tone

The recipient should think: "This is personalized and relevant to me."`;
  }

  // Build the complete prompt
  const fullPrompt = agentConfig.emailTemplate
    .replace('{recipient_info}', recipientInfo || 'Email address only - no additional profile information provided. Use professional courtesy approach.')
    .replace('{sender_info}', senderInfo || 'Professional sender information not provided. Sign generically.')
    .replace('{email_purpose}', agentConfig.emailPurpose)
    + adaptiveGuidance;

  return fullPrompt;
};

// ============================================================================
// QUALITY VALIDATION
// ============================================================================

export const validateGeneratedEmail = (email, subject, recipientData) => {
  const issues = [];
  const warnings = [];

  // Check for placeholders
  const placeholderPatterns = [
    { pattern: /\[([^\]]+)\]/g, name: 'Square brackets' },
    { pattern: /\{([^}]+)\}/g, name: 'Curly braces' },
    { pattern: /<([^>]+)>/g, name: 'Angle brackets' },
    { pattern: /YOUR_\w+/gi, name: 'YOUR_ prefix' },
    { pattern: /\bINSERT\b/gi, name: 'INSERT keyword' },
    { pattern: /\bADD YOUR\b/gi, name: 'ADD YOUR phrase' }
  ];

  placeholderPatterns.forEach(({ pattern, name }) => {
    const emailMatches = email.match(pattern);
    const subjectMatches = subject.match(pattern);
    if (emailMatches || subjectMatches) {
      issues.push(`Contains placeholder (${name}): ${(emailMatches || subjectMatches)[0]}`);
    }
  });

  // Check for formatting issues
  if (email.includes('**') || email.includes('__')) {
    issues.push('Contains markdown bold formatting (**text**)');
  }
  if (email.match(/\*[^*]+\*/)) {
    issues.push('Contains markdown italic formatting (*text*)');
  }
  if (email.match(/^[\s]*[-*]\s/m)) {
    warnings.push('Contains bullet points (may display poorly)');
  }

  // Check for generic phrases
  const genericPhrases = [
    'I hope this email finds you well',
    'I hope you\'re doing well',
    'I hope you are well',
    'Hope you\'re having a great day',
    'I came across your profile',
    'Your profile caught my attention',
    'I was browsing through profiles',
    'I stumbled upon your profile'
  ];

  genericPhrases.forEach(phrase => {
    if (email.toLowerCase().includes(phrase.toLowerCase())) {
      warnings.push(`Generic phrase detected: "${phrase}"`);
    }
  });

  // Check if email uses recipient's name (if available)
  if (recipientData.name && !email.includes(recipientData.name)) {
    warnings.push('Recipient name not used in email body (consider adding for personalization)');
  }

  // Check length (should be between 50-300 words)
  const wordCount = email.split(/\s+/).length;
  if (wordCount < 50) {
    warnings.push(`Email is quite short (${wordCount} words). Consider adding more context.`);
  }
  if (wordCount > 300) {
    warnings.push(`Email is quite long (${wordCount} words). Consider being more concise.`);
  }

  // Check subject line length
  if (subject.length > 70) {
    warnings.push(`Subject line is long (${subject.length} chars). May be truncated on mobile.`);
  }
  if (subject.length < 10) {
    warnings.push(`Subject line is very short (${subject.length} chars). Consider making it more descriptive.`);
  }

  return {
    isValid: issues.length === 0,
    hasWarnings: warnings.length > 0,
    issues,
    warnings,
    qualityScore: calculateQualityScore(issues, warnings, email, recipientData)
  };
};

// Calculate a quality score (0-100)
const calculateQualityScore = (issues, warnings, email, recipientData) => {
  let score = 100;

  // Deduct for critical issues
  score -= issues.length * 20;

  // Deduct for warnings
  score -= warnings.length * 5;

  // Bonus for using recipient data
  if (recipientData.name && email.includes(recipientData.name)) {
    score += 5;
  }

  // Bonus for good length
  const wordCount = email.split(/\s+/).length;
  if (wordCount >= 80 && wordCount <= 200) {
    score += 5;
  }

  return Math.max(0, Math.min(100, score));
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Extract greeting name from recipient data
export const getGreetingName = (recipientData) => {
  if (recipientData.name) {
    // If there's a full name, try to get first name or use full name
    const nameParts = recipientData.name.trim().split(' ');
    return nameParts[0];
  }
  return null;
};

// Generate suggested improvements for low-quality emails
export const suggestImprovements = (validationResult, recipientData) => {
  const suggestions = [];

  if (validationResult.issues.length > 0) {
    suggestions.push('CRITICAL: Fix placeholder and formatting issues before sending');
  }

  if (validationResult.warnings.some(w => w.includes('Generic phrase'))) {
    suggestions.push('Make the opening more specific to this recipient');
  }

  if (recipientData.name && validationResult.warnings.some(w => w.includes('name not used'))) {
    suggestions.push(`Consider addressing them by name (${recipientData.name})`);
  }

  if (validationResult.qualityScore < 70) {
    suggestions.push('Overall quality is low - consider regenerating this email');
  }

  return suggestions;
};

// ============================================================================
// EXPORT
// ============================================================================

export default {
  DEFAULT_AGENT_CONFIG,
  buildPersonalizedPrompt,
  validateGeneratedEmail,
  getGreetingName,
  suggestImprovements
};