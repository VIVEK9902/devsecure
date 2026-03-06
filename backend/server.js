const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const scanRoutes = require('./routes/scanRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'DevSecure API' });
});

app.use('/api', scanRoutes);

// Centralized error response so controllers can forward exceptions.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`DevSecure backend running on port ${PORT}`);
});
