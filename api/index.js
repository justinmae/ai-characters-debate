// Serverless entry point for Vercel
import express from 'express';
import cors from 'cors';

const app = express();

// Configure CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', // Vite dev server
  'https://ai-characters-debate.vercel.app',
  'https://ai-characters-debate-6b93hwcrt-justinmaes-projects.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API status route
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API is running',
    endpoints: ['/api/text-to-speech', '/api/news']
  });
});

// Export the handler for serverless
export default function(req, res) {
  // Log the request for debugging
  console.log(`Received ${req.method} request to ${req.url}`);
  return app(req, res);
} 