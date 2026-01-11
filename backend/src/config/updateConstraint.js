const { Pool } = require('pg');
require('dotenv').config();

async function updateConstraint() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    // Drop the old constraint
    await pool.query(`
      ALTER TABLE games
      DROP CONSTRAINT IF EXISTS games_game_status_check;
    `);

    // Add the new constraint with more values
    await pool.query(`
      ALTER TABLE games
      ADD CONSTRAINT games_game_status_check
      CHECK (game_status IN ('in_progress', 'red_wins', 'blue_wins', 'abandoned', 'red_blocked', 'blue_blocked'));
    `);

    console.log('Constraint updated successfully');
  } catch (error) {
    console.error('Error updating constraint:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

updateConstraint()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
