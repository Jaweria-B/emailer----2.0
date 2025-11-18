
// ============================================================================
// ENHANCED EMAIL GENERATION PROMPT SYSTEM
// Purpose-Driven Email Creation with Industry Best Practices
// ============================================================================

// ============================================================================
// DETAILED PURPOSE-SPECIFIC INSTRUCTIONS
// Each purpose has comprehensive guidance following industry best practices
// ============================================================================

const getPurposeInstruction = (purpose) => {
  const instructions = {
    // ------------------------------------------------------------------------
    // MARKETING PITCH / PROPOSAL
    // ------------------------------------------------------------------------
    'proposal': `
📧 PURPOSE: Marketing Pitch / Business Proposal

APPROACH: Use proven marketing email frameworks (AIDA, PAS, BAB)

STRUCTURE YOUR EMAIL USING THIS WINNING FORMULA:

1. HOOK (First 1-2 sentences):
   - Start with a compelling problem, surprising statistic, or relatable pain point
   - Make the recipient think "This is about ME"
   - Example: "Are you spending 10+ hours weekly on manual email outreach with minimal results?"

2. AGITATE THE PAIN (Next paragraph):
   - Expand on the problem and its consequences
   - Use emotional triggers (frustration, lost opportunity, wasted time/money)
   - Build urgency without being pushy

3. INTRODUCE THE SOLUTION (Core paragraph):
   - Present your product/service as the natural answer
   - Focus on BENEFITS not features
   - Use concrete numbers, results, or proof points
   - Example: "Our AI-powered platform generates 200 personalized emails in minutes, increasing response rates by 300%"

4. BUILD CREDIBILITY:
   - Include social proof if available (testimonials, case studies, notable clients)
   - Mention specific results or transformations
   - Use authority signals (industry expertise, certifications, partnerships)

5. CLEAR CALL-TO-ACTION:
   - One specific, easy next step
   - Create urgency (limited time, exclusive offer, early access)
   - Remove friction (free trial, no credit card, easy demo)
   - Example: "Would you be open to a 15-minute demo this week to see how we can 3x your email response rates?"

TONE & STYLE:
- Confident but not arrogant
- Benefit-focused, not feature-focused
- Use "you" and "your" more than "we" and "our"
- Write conversationally, not like a corporate brochure
- Short paragraphs (2-4 sentences max)
- Use power words: proven, guaranteed, transform, breakthrough, exclusive

AVOID:
- Generic claims without proof
- Lengthy feature lists
- Multiple CTAs (confuses the recipient)
- Desperation or aggressive pressure tactics
- Jargon or technical terms unless audience-appropriate
`,

    // ------------------------------------------------------------------------
    // MAKING A REQUEST
    // ------------------------------------------------------------------------
    'request': `
📧 PURPOSE: Making a Request

APPROACH: Clear, respectful, and easy to say "yes" to

STRUCTURE YOUR EMAIL:

1. OPEN WITH CONTEXT (1-2 sentences):
   - Briefly explain why you're reaching out
   - Establish relevance to the recipient
   - Example: "I'm reaching out because of your expertise in healthcare technology innovation"

2. STATE YOUR REQUEST CLEARLY (1 paragraph):
   - Be specific and direct - no beating around the bush
   - Make it crystal clear what you need
   - Example: "I'd like to request a 30-minute meeting to discuss potential collaboration opportunities"

3. EXPLAIN THE "WHY" (1 paragraph):
   - Why this matters
   - What's in it for them (mutual benefit)
   - How it connects to their interests or goals
   - Be genuine, not manipulative

4. MAKE IT EASY TO SAY YES (1 paragraph):
   - Remove barriers and friction
   - Offer options or flexibility
   - Be considerate of their time
   - Example: "I'm flexible on timing and happy to work around your schedule. Even a brief 15-minute call would be valuable"

5. GRACIOUS CLOSING:
   - Express appreciation in advance
   - Make it clear there's no pressure
   - Provide easy next steps

TONE & STYLE:
- Respectful but not submissive
- Direct but not demanding
- Confident but not entitled
- Warm and professional

POWER PHRASES TO USE:
- "I would greatly appreciate..."
- "Would you be open to..."
- "I understand you're busy, so..."
- "At your convenience..."
- "No pressure at all, but..."

AVOID:
- Apologizing excessively ("Sorry to bother you")
- Being vague about what you want
- Making assumptions about their availability
- Guilt-tripping or emotional manipulation
`,

    // ------------------------------------------------------------------------
    // FOLLOW-UP
    // ------------------------------------------------------------------------
    'follow-up': `
📧 PURPOSE: Follow-Up Communication

APPROACH: Persistent but polite, value-added, not annoying

STRUCTURE YOUR EMAIL:

1. REFERENCE THE PREVIOUS INTERACTION (First sentence):
   - Mention the specific previous email, meeting, or conversation
   - Use exact dates or details to jog their memory
   - Example: "Following up on my email from Tuesday about the AI automation demo"

2. ADD NEW VALUE (Core paragraph):
   - DO NOT just say "checking in" or "bumping this up"
   - Provide something new: additional information, relevant insight, helpful resource
   - Share something that reinforces why this matters
   - Example: "Since we last spoke, I came across this case study showing 40% improvement in patient communication - thought it might be relevant to your goals"

3. GENTLE REMINDER OF CONTEXT (Brief):
   - Softly restate what you were discussing or requesting
   - Keep it concise - they can reference the previous email for details

4. EASY OUT + CLEAR NEXT STEP (Final paragraph):
   - Give them permission to decline
   - Offer a simple yes/no or easy action
   - Example: "If this isn't a priority right now, I completely understand. Otherwise, would next week work for a brief call?"

5. CONSIDERATE CLOSING:
   - Acknowledge their busy schedule
   - Express understanding and patience

TONE & STYLE:
- Patient and understanding, never desperate
- Value-focused, not reminder-focused
- Professional with a touch of warmth
- Confident that your offering has merit

FOLLOW-UP FREQUENCY GUIDANCE:
- First follow-up: 3-5 business days after initial email
- Second follow-up: 1 week after first follow-up
- Final follow-up: 1-2 weeks after second, then move on

POWER PHRASES:
- "I wanted to circle back..."
- "Just wanted to ensure this didn't get lost..."
- "I realize you're busy, so..."
- "No rush at all, but..."
- "Completely understand if the timing isn't right..."

AVOID:
- Sounding annoyed or passive-aggressive
- Just saying "any update?" with no added value
- Following up too frequently (looks desperate)
- Assuming they ignored you (maybe it got lost, they forgot, or they're genuinely busy)
`,

    // ------------------------------------------------------------------------
    // THANK YOU
    // ------------------------------------------------------------------------
    'thank-you': `
📧 PURPOSE: Expressing Gratitude

APPROACH: Genuine, specific, warm, and relationship-building

STRUCTURE YOUR EMAIL:

1. LEAD WITH GRATITUDE (First sentence):
   - Express thanks immediately and directly
   - Be specific about what you're thanking them for
   - Example: "Thank you so much for taking the time to meet with me yesterday to discuss healthcare automation"

2. BE SPECIFIC ABOUT IMPACT (Main paragraph):
   - Don't just say "thank you" - explain WHY it mattered
   - Share specific insights, outcomes, or feelings
   - Show that their time/effort/help had real value
   - Example: "Your insights about patient communication challenges gave me three new ideas for how our platform can better serve healthcare providers"

3. ACKNOWLEDGE THEIR EFFORT/GENEROSITY (1-2 sentences):
   - Recognize that they took time, shared expertise, or went out of their way
   - Show that you don't take it for granted
   - Example: "I know how busy you are with the hospital expansion, so I especially appreciate you carving out time"

4. FORWARD-LOOKING STATEMENT (Optional but recommended):
   - Hint at continued relationship
   - Mention a specific next step if appropriate
   - Keep the door open for future connection
   - Example: "I'm excited to send over the demo access as we discussed. Looking forward to your feedback"

5. CLOSING WITH WARMTH:
   - Reiterate gratitude
   - Use warm, sincere closing phrase
   - Sign naturally

TONE & STYLE:
- Warm and genuine (not robotic)
- Enthusiastic but not over-the-top
- Professional yet personal
- Sincere appreciation, not flattery

POWER PHRASES:
- "I truly appreciate..."
- "I'm grateful for..."
- "It meant a lot that..."
- "I gained so much from..."
- "Your [advice/time/support] made a real difference..."

TIMING MATTERS:
- Send within 24 hours while the interaction is fresh
- Faster is better (shows genuine appreciation, not obligation)

AVOID:
- Generic, template-feeling thank you messages
- Overly formal or stiff language
- Turning it into a sales pitch or request
- Being too brief (1 sentence isn't enough for meaningful gratitude)
`,

    // ------------------------------------------------------------------------
    // APOLOGY
    // ------------------------------------------------------------------------
    'apology': `
📧 PURPOSE: Sincere Apology

APPROACH: Take responsibility, show empathy, offer solution

STRUCTURE YOUR EMAIL:

1. APOLOGIZE IMMEDIATELY (First sentence):
   - No excuses or explanations first
   - Direct and sincere apology upfront
   - Use "I apologize" rather than "I'm sorry if..."
   - Example: "I apologize for missing our scheduled meeting this morning"

2. TAKE FULL RESPONSIBILITY (1-2 sentences):
   - No blame-shifting or excuses
   - Acknowledge exactly what went wrong
   - Own the mistake completely
   - Example: "I made an error in my calendar management and there's no excuse for not honoring our commitment"

3. ACKNOWLEDGE THE IMPACT (1 paragraph):
   - Show you understand how this affected them
   - Demonstrate empathy
   - Validate their inconvenience, frustration, or disappointment
   - Example: "I realize this wasted your valuable time and was disrespectful of your schedule, especially given how busy you are"

4. OFFER A SOLUTION OR REMEDY (1 paragraph):
   - If possible, provide a concrete fix
   - Explain what you'll do differently
   - Make it right if you can
   - Show this won't happen again
   - Example: "I'd like to reschedule at your earliest convenience. I've implemented a new calendar system with double confirmation to prevent this from happening again"

5. REAFFIRM THE RELATIONSHIP (Closing):
   - Express that you value them
   - Show this mistake doesn't reflect your usual standard
   - Keep it brief and sincere

TONE & STYLE:
- Humble and sincere
- Professional and accountable
- Empathetic and understanding
- NO defensiveness or justification

WHAT MAKES A GOOD APOLOGY:
- Specific (say exactly what you're apologizing for)
- Unconditional (no "but" or "however")
- Action-oriented (explain how you'll fix it)
- Timely (apologize as soon as you realize the mistake)

AVOID:
- "I'm sorry you feel that way" (invalidating)
- "I'm sorry, but..." (not a real apology)
- Lengthy explanations that sound like excuses
- Minimizing the issue ("It's not a big deal")
- Making it about you ("I feel terrible")
- Over-apologizing (diminishes sincerity)
- Blaming circumstances or others
`,

    // ------------------------------------------------------------------------
    // INVITATION
    // ------------------------------------------------------------------------
    'invitation': `
📧 PURPOSE: Invitation

APPROACH: Clear, welcoming, and provides all essential information

STRUCTURE YOUR EMAIL:

1. EXTEND THE INVITATION CLEARLY (First paragraph):
   - State what you're inviting them to
   - Make it sound appealing and valuable
   - Create enthusiasm
   - Example: "I'd love to invite you to an exclusive demo session of our new AI healthcare communication platform"

2. PROVIDE THE ESSENTIAL DETAILS (Main section):
   Use the 5 W's approach:
   - WHAT: Event type, topic, or purpose
   - WHEN: Date and time (include timezone, duration)
   - WHERE: Location (physical address or virtual meeting link)
   - WHY: Purpose and value for attendees
   - WHO: Other attendees if relevant (speakers, special guests)

   Format for clarity:
   📅 Date: Tuesday, March 15th
   🕐 Time: 2:00 PM - 3:00 PM PST
   📍 Location: Zoom (link to follow upon confirmation)
   👥 Format: Interactive demo with Q&A

3. EXPLAIN THE VALUE (1 paragraph):
   - What will they gain from attending?
   - Why is this worth their time?
   - What makes this special or exclusive?
   - Example: "You'll see firsthand how AI can reduce patient communication time by 80% while improving personalization"

4. MAKE THEM FEEL SPECIAL (1-2 sentences):
   - Explain why you specifically invited them
   - Make it personal, not mass invitation feeling
   - Example: "Given your innovative work on patient engagement at Indus Hospital, I thought this would be particularly relevant to your initiatives"

5. CLEAR CALL-TO-ACTION (Closing):
   - Easy way to RSVP or confirm
   - Deadline if applicable
   - What happens next after they confirm
   - Example: "Please let me know if you can join us. I'll send the access details once you confirm"

TONE & STYLE:
- Warm and welcoming
- Enthusiastic but professional
- Clear and organized
- Make them feel valued and wanted

ADDITIONAL ELEMENTS (when appropriate):
- Agenda or schedule
- Dress code (for in-person events)
- What to bring or prepare
- Plus-one policy
- Dietary restrictions (for meals)
- Parking or transportation details

AVOID:
- Vague details ("sometime next week")
- Information overload (keep it scannable)
- Sounding obligatory or routine
- Forgetting time zones for virtual events
- Missing RSVP instructions
`,

    // ------------------------------------------------------------------------
    // COMPLAINT / ISSUE
    // ------------------------------------------------------------------------
    'complaint': `
📧 PURPOSE: Raising a Complaint or Issue

APPROACH: Professional, factual, solution-oriented

STRUCTURE YOUR EMAIL:

1. STATE THE ISSUE CLEARLY (First paragraph):
   - Be direct and specific about the problem
   - Avoid emotional language in the opening
   - Stay factual
   - Example: "I'm writing to address an issue with the product delivery that arrived three days late and was damaged"

2. PROVIDE CONTEXT AND DETAILS (Main section):
   - When did this happen? (dates, times)
   - What exactly occurred?
   - Who was involved if relevant?
   - What was the expected outcome vs. actual outcome?
   - Include any reference numbers, order IDs, or documentation

   Example format:
   - Order #12345 placed on March 1st
   - Delivery promised by March 5th
   - Actually arrived March 8th
   - Package showed visible external damage
   - Product inside was non-functional

3. EXPLAIN THE IMPACT (1 paragraph):
   - How has this affected you or your business?
   - What are the consequences?
   - Keep it factual, not dramatic
   - Example: "This delay caused us to miss our client presentation and has affected our business relationship with them"

4. PROPOSE A SOLUTION (1 paragraph):
   - State what you'd like to happen
   - Be reasonable and specific
   - Offer options if possible
   - Example: "I would appreciate either a full refund or a replacement unit shipped via express delivery, along with compensation for the business impact"

5. PROFESSIONAL CLOSING:
   - Express hope for resolution
   - Provide your contact information
   - Set a reasonable timeline for response
   - Example: "I look forward to resolving this matter by end of week. Please let me know the next steps"

TONE & STYLE:
- Professional and composed (not angry)
- Firm but respectful
- Factual rather than emotional
- Solution-focused, not blame-focused
- Assertive but not aggressive

ESCALATION LANGUAGE (when needed):
- "I've previously contacted [person/department] on [date] without resolution"
- "This is my [second/third] attempt to resolve this matter"
- "I need to escalate this to [manager/supervisor] if we cannot resolve it"

POWER PHRASES:
- "I need to bring to your attention..."
- "I was disappointed to find..."
- "This doesn't align with the service level I expected..."
- "I trust we can resolve this promptly..."
- "I'm confident you'll want to make this right..."

AVOID:
- Threatening legal action in first communication
- Personal attacks or insults
- ALL CAPS or excessive punctuation (!!!)
- Emotional venting
- Vague complaints without specifics
- Unreasonable demands
- Burning bridges (stay professional)
`,

    // ------------------------------------------------------------------------
    // GENERAL COMMUNICATION
    // ------------------------------------------------------------------------
    'general': `
📧 PURPOSE: General Communication

APPROACH: Clear, professional, and purpose-appropriate

STRUCTURE YOUR EMAIL:

1. CLEAR OPENING (1-2 sentences):
   - State your purpose immediately
   - Provide necessary context
   - Example: "I'm reaching out regarding our upcoming project deadline and wanted to coordinate next steps"

2. MAIN MESSAGE (2-3 paragraphs):
   - Cover all key points logically
   - Use paragraphs to separate different topics
   - Be clear and concise
   - Provide necessary details without overwhelming

3. ACTIONABLE NEXT STEPS (if applicable):
   - Clearly state what you need
   - Specify deadlines if relevant
   - Make it obvious what happens next

4. PROFESSIONAL CLOSING:
   - Appropriate sign-off for the relationship
   - Include contact information if needed

TONE & STYLE:
- Professional and clear
- Friendly but businesslike
- Structured and easy to follow
- Appropriate formality for the relationship

BEST PRACTICES:
- Use clear subject lines
- Break up long paragraphs
- Highlight important information
- Proofread before sending
- Use proper grammar and punctuation

AVOID:
- Unnecessary wordiness
- Unclear purpose or rambling
- Missing important context
- Too casual for the relationship
- Too formal and stiff
`
  };

  return instructions[purpose] || instructions['general'];
};

// ============================================================================
// OTHER INSTRUCTION FUNCTIONS (Enhanced versions)
// ============================================================================

const getToneInstruction = (tone) => {
  const instructions = {
    'professional': 'Use clear, polished business language. Confident and competent without being stiff or robotic.',
    'formal': 'Use formal business language with proper structure, respectful distance, and traditional professional conventions.',
    'friendly': 'Use warm, approachable language with conversational flow while maintaining professional boundaries.',
    'warm': 'Use empathetic, personable language that shows genuine care. Build connection and trust.',
    'concise': 'Be direct and efficient. Use short sentences. Eliminate unnecessary words. Get to the point.',
    'enthusiastic': 'Show genuine excitement and positive energy. Use upbeat language while staying professional.'
  };

  return `TONE: ${instructions[tone] || instructions['professional']}`;
};

const getRelationshipInstruction = (relationship) => {
  const instructions = {
    'professional': 'Write as a respected professional colleague. Maintain appropriate formality without being distant.',
    'client': 'Use service-oriented, attentive language. Show respect for their needs and demonstrate value.',
    'manager': 'Be respectful and professional. Demonstrate competence, accountability, and clear communication.',
    'friend': 'Use warm, friendly tone while maintaining email professionalism. Natural and personable.',
    'unknown': 'Use polite, professional first-contact tone. Introduce yourself clearly if appropriate.'
  };

  return `RELATIONSHIP CONTEXT: ${instructions[relationship] || instructions['professional']}`;
};

const getPriorityInstruction = (priority) => {
  const instructions = {
    'urgent': 'URGENT MATTER: Convey time-sensitivity professionally. Be direct about urgency without being aggressive. Clearly state deadlines or time constraints.',
    'high': 'HIGH PRIORITY: Communicate importance clearly. Explain why timely attention matters. Maintain professionalism while emphasizing significance.',
    'normal': 'STANDARD PRIORITY: Use appropriate professional tone. No special urgency needed.',
    'low': 'LOW PRIORITY: Keep tone relaxed and non-pressing. Make it clear there\'s no rush or pressure.'
  };

  return instructions[priority] || instructions['normal'];
};

const getLengthInstruction = (length) => {
  const instructions = {
    'short': 'LENGTH: 1-2 SHORT paragraphs maximum (3-5 sentences total). Get to the point immediately. Be extremely concise.',
    'medium': 'LENGTH: 3-4 balanced paragraphs (8-12 sentences total). Cover all necessary points with appropriate detail.',
    'long': 'LENGTH: 5+ comprehensive paragraphs (15+ sentences). Provide thorough details, context, and complete information.'
  };

  return instructions[length] || instructions['medium'];
};

// ============================================================================
// ENHANCED MAIN PROMPT CREATION FUNCTION
// ============================================================================

export const createPrompt = (formData) => {
  return `You are an expert email writing assistant specializing in business communication. Transform the following raw thoughts into a polished, professional email that follows industry best practices for the specified purpose.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 CRITICAL FORMATTING RULES - READ FIRST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. OUTPUT FORMAT: Return ONLY a valid JSON object: {"subject": "...", "body": "..."}

2. PLAIN TEXT ONLY: 
   ❌ NO bold (**text**) - it breaks the display
   ❌ NO italics (*text*)
   ❌ NO markdown formatting
   ❌ NO bullet points using * or -
   ✅ Use plain text only

3. NO PLACEHOLDERS OR TEMPLATES:
   ❌ NEVER use: [Name], [Date], [Company], [Time], [Location], [Insert X], [Add Y]
   ❌ NEVER write: "Please insert...", "Add your...", "Include...", "[Your company name]"
   ✅ Write complete, ready-to-send sentences

4. NO CODE BLOCKS OR FORMATTING:
   ❌ Do not wrap response in \`\`\`json or \`\`\` 
   ✅ Just return the raw JSON object

5. WRITE NATURALLY:
   - If specific information is missing, write around it gracefully
   - Use general phrasing or context clues
   - Make every email feel complete and ready to send AS-IS
   - No template markers or instructions to the user

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 EMAIL CONTENT TO TRANSFORM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RAW THOUGHTS: ${formData.rawThoughts}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ EMAIL PARAMETERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${formData.recipient ? `📧 Recipient: ${formData.recipient}` : '📧 Recipient: Not specified - use modern email greeting like "Hi there," or "Hello," or more such greetings that would compensate for the recipients name and would not disturb the email performace or look.'}
${formData.senderName ? `✍️ Sender Name: ${formData.senderName}` : '✍️ Sender Name: Not specified (use generic closing)'}
${formData.subject ? `📌 Subject Context: ${formData.subject}` : '📌 Subject: Create appropriate subject line'}
${formData.context ? `📋 Additional Context: ${formData.context}` : ''}
${formData.replyingTo ? `↩️ This is a REPLY to the following email:\n${formData.replyingTo}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 EMAIL PURPOSE & BEST PRACTICES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${getPurposeInstruction(formData.purpose)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 WRITING STYLE REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${getToneInstruction(formData.tone)}

${getRelationshipInstruction(formData.relationship)}

${getPriorityInstruction(formData.priority)}

${getLengthInstruction(formData.length)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✉️ EMAIL STRUCTURE REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. SUBJECT LINE:
   - Create a clear, compelling subject line
   - Make it specific to the purpose and content
   - Use action-oriented language when appropriate
   - Keep it under 60 characters for mobile viewing

2. EMAIL BODY:
   - Include appropriate greeting if needed
   - Use clear paragraphs with logical flow
   - Make it scannable and easy to read
   - Keep paragraphs short (2-4 sentences)
   - Use white space effectively

3. SIGNATURE:
   ${formData.senderName 
     ? `End with professional closing phrase followed by: "${formData.senderName}"` 
     : 'End with appropriate closing phrase (e.g., "Best regards,") but DO NOT add a signature name since none was provided'}

4. OVERALL FEEL:
   - Write as if you personally researched this recipient
   - Make it feel crafted specifically for them
   - Natural and conversational within the professional context
   - Ready to send without any editing needed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ FINAL QUALITY CHECKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before returning your response, verify:
✅ Response is valid JSON: {"subject": "...", "body": "..."}
✅ No bold (**), italics (*), or markdown formatting
✅ No placeholders like [Name], [Date], [Company]
✅ No template instructions or brackets
✅ Email reads naturally and feels complete
✅ Appropriate tone and style for the purpose
✅ Clear structure with good paragraph breaks
✅ Subject line is compelling and specific
✅ Length matches the requirement
✅ Signature follows the specifications

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 GENERATE THE EMAIL NOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY the JSON object with your professionally crafted email:`;
};

// ============================================================================
// EXPORT FOR USE IN YOUR APPLICATION
// ============================================================================

export {
  getPurposeInstruction,
  getToneInstruction,
  getRelationshipInstruction,
  getPriorityInstruction,
  getLengthInstruction
};
