// src/lib/ai-config.js
export const AI_PROVIDERS = {
  GEMINI: 'gemini'
};

export const AI_MODELS = {
  [AI_PROVIDERS.GEMINI]: 'gemini-2.5-flash'
};

export const AI_ENDPOINTS = {
  [AI_PROVIDERS.GEMINI]: 'https://generativelanguage.googleapis.com/v1beta/models'
};

export const AI_PROVIDER_INFO = {
  [AI_PROVIDERS.GEMINI]: {
    name: 'Google Gemini',
    description: 'Google\'s Official Gemini 2.5 Flash Model',
    keyFormat: 'API Key (Get from Google AI Studio)',
    website: 'https://aistudio.google.com/'
  }
};