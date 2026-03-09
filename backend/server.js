const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

dotenv.config();

const scanRoutes = require('./routes/scanRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

/*
-----------------------------------------
Security Middleware
-----------------------------------------
*/
app.use(helmet());

/*
-----------------------------------------
CORS Configuration
Allows frontend (Vercel) to access backend
-----------------------------------------
*/
app.use(
  cors({
    origin: '*', // for demo projects. In production you should restrict this.
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

/*
-----------------------------------------
Body Parser
-----------------------------------------
*/
app.use(express.json());

/*
-----------------------------------------
Health Check Endpoint
Used by Render to check if service is alive
-----------------------------------------
*/
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'DevSecure API',
    timestamp: new Date(),
  });
});

/*
-----------------------------------------
API Routes
-----------------------------------------
*/
app.use('/api', scanRoutes);
app.use('/api/ai', aiRoutes);

/*
-----------------------------------------
Global Error Handler
-----------------------------------------
*/
app.use((err, req, res, next) => {
  console.error('Server Error:', err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

/*
-----------------------------------------
Start Server
-----------------------------------------
*/
app.listen(PORT, () => {
  console.log(`DevSecure backend running on port ${PORT}`);
});