const express = require('express');
const cors = require('cors');
require('dotenv').config();

const gameRoutes = require('./routes/game');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/game', gameRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Knight Chase API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
