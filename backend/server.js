const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

dotenv.config();

const scanRoutes = require('./routes/scanRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'DevSecure API',
    timestamp: new Date(),
  });
});

app.use('/api', scanRoutes);
app.use('/api/ai', aiRoutes);

app.use((err, req, res, next) => {
  console.error('Server Error:', err);

  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`DevSecure backend running on port ${PORT}`);
});