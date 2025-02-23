import OpenAI from 'openai'
import dotenv from 'dotenv'
dotenv.config()

if (!process.env.VITE_OPENAI_API_KEY) {
  throw new Error('Missing VITE_OPENAI_API_KEY environment variable')
}

export const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, API calls should be made from the backend
}) 