import app from './server.js';

const port = Number(process.env.PORT) || 8080;
const host = '0.0.0.0';

console.log('Starting server...');
try {
  app.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
  });
} catch (error) {
  console.error('Error starting server:', error);
} 