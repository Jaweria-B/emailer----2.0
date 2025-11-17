// src/lib/ai-config.js
export const AI_PROVIDERS = {
  GEMINI: 'gemini'
};

export const AI_MODELS = {
  [AI_PROVIDERS.GEMINI]: 'gemini-2.5-flash-lite' 
};

export const AI_ENDPOINTS = {
  [AI_PROVIDERS.GEMINI]: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent' 
};
