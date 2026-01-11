const { Pool } = require('pg');
require('dotenv').config();

async function checkCurrentGame() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    const result = await pool.query(
      'SELECT * FROM games WHERE game_status = $1 ORDER BY updated_at DESC LIMIT 1',
      ['in_progress']
    );

    if (result.rows.length > 0) {
      const game = result.rows[0];
      console.log('Current Game State:');
      console.log('ID:', game.id);
      console.log('Current Player:', game.current_player);
      console.log('Red Position:', `(${game.red_position_x}, ${game.red_position_y})`);
      console.log('Blue Position:', `(${game.blue_position_x}, ${game.blue_position_y})`);
      console.log('Turn Number:', game.turn_number);
      console.log('Blocked Squares:', JSON.stringify(game.blocked_squares, null, 2));
      console.log('Game Status:', game.game_status);
    } else {
      console.log('No active game found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkCurrentGame();
