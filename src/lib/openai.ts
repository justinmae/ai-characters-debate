import OpenAI from 'openai'

// For Node.js scripts
// import dotenv from 'dotenv'
// dotenv.config()
// if (!process.env.OPENAI_API_KEY) {
//   throw new Error('Missing OPENAI_API_KEY environment variable')
// }

// For Vite frontend
if (!import.meta.env.VITE_OPENAI_API_KEY) {
  throw new Error('Missing VITE_OPENAI_API_KEY environment variable')
}

export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY, // For Vite frontend
  // apiKey: process.env.OPENAI_API_KEY, // For Node.js scripts
  dangerouslyAllowBrowser: true // Note: In production, API calls should be made from the backend
}) 