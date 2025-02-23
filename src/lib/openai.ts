import OpenAI from 'openai'
import dotenv from 'dotenv'

// Load environment variables for Node.js
if (typeof process !== 'undefined') {
  dotenv.config()
}

// Get API key with proper type checking and environment detection
const getApiKey = () => {
  // Browser environment
  if (typeof window !== 'undefined') {
    return import.meta.env?.VITE_OPENAI_API_KEY
  }
  // Node.js environment
  return process.env.OPENAI_API_KEY
}

const apiKey = getApiKey()

if (!apiKey) {
  throw new Error('Missing OpenAI API key - Please set either VITE_OPENAI_API_KEY (browser) or OPENAI_API_KEY (Node.js) environment variable')
}

// For Vite frontend
// if (!import.meta.env.VITE_OPENAI_API_KEY) {
// throw new Error('Missing VITE_OPENAI_API_KEY environment variable')
// }

export const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true // Note: In production, API calls should be made from the backend
})

// Helper to validate OpenAI response format
export const validateOpenAIResponse = <T>(response: unknown): T => {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response format from OpenAI')
  }
  return response as T
} 