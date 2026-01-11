const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = require('./config/database');
const gameRoutes = require('./routes/game');

const app = express();
const PORT = process.env.PORT || 5001;

// Initialize database schema on startup
async function initializeDatabase() {
  try {
    console.log('Initializing database schema...');
    const schemaPath = path.join(__dirname, 'config', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error.message);
    // Don't crash if tables already exist
    if (error.code !== '42P07') { // 42P07 = table already exists
      console.error('Database initialization failed, but continuing...');
    }
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/game', gameRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Knight Chase API is running' });
});

// Initialize database then start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to initialize:', error);
  process.exit(1);
});
