const pool = require('../config/database');
const { validateMove, checkWinCondition, getValidMoves } = require('../utils/gameLogic');

// Check if current player is blocked (has no valid moves)
const checkIfPlayerBlocked = async (gameState) => {
  // Only check after both players have placed (turn >= 2)
  if (gameState.turn_number < 2) {
    return null;
  }

  const currentPlayer = gameState.current_player;
  const currentX = currentPlayer === 'red' ? gameState.red_position_x : gameState.blue_position_x;
  const currentY = currentPlayer === 'red' ? gameState.red_position_y : gameState.blue_position_y;
  const opponentX = currentPlayer === 'red' ? gameState.blue_position_x : gameState.red_position_x;
  const opponentY = currentPlayer === 'red' ? gameState.blue_position_y : gameState.red_position_y;

  // If player hasn't placed yet, they can't be blocked
  if (currentX === null || currentY === null) {
    return null;
  }

  // Get valid moves for current player
  const validMoves = getValidMoves(currentX, currentY, gameState.blocked_squares, opponentX, opponentY);

  // If no valid moves, current player is blocked
  if (validMoves.length === 0) {
    const winner = currentPlayer === 'red' ? 'blue' : 'red';
    return { winner, reason: 'blocked' };
  }

  return null;
};

// Get current game state
const getCurrentGame = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM games WHERE game_status = $1 ORDER BY updated_at DESC LIMIT 1',
      ['in_progress']
    );

    if (result.rows.length === 0) {
      return res.json({ game: null, message: 'No active game' });
    }

    const gameState = result.rows[0];

    // Check if current player has no valid moves
    const blockCheck = await checkIfPlayerBlocked(gameState);
    if (blockCheck) {
      // End game - current player is blocked
      const gameStatus = blockCheck.winner === 'red' ? 'red_wins' : 'blue_wins';
      await pool.query(
        'UPDATE games SET game_status = $1 WHERE id = $2',
        [gameStatus, gameState.id]
      );

      // Update scores
      const scoreField = blockCheck.winner === 'red' ? 'red_wins' : 'blue_wins';
      await pool.query(
        `UPDATE scores SET ${scoreField} = ${scoreField} + 1, total_games = total_games + 1, updated_at = CURRENT_TIMESTAMP`
      );

      // Add to game history
      await pool.query(
        'INSERT INTO game_history (game_id, winner, total_turns) VALUES ($1, $2, $3)',
        [gameState.id, blockCheck.winner, gameState.turn_number]
      );

      // Get final game state
      const finalGame = await pool.query('SELECT * FROM games WHERE id = $1', [gameState.id]);

      return res.json({
        game: finalGame.rows[0],
        winner: blockCheck.winner,
        reason: blockCheck.reason,
        message: `${blockCheck.winner.toUpperCase()} wins! ${gameState.current_player.toUpperCase()} has no valid moves.`
      });
    }

    res.json({ game: gameState });
  } catch (error) {
    console.error('Error getting current game:', error);
    res.status(500).json({ error: 'Failed to get game state' });
  }
};

// Create new game
const createNewGame = async (req, res) => {
  try {
    // End any existing in-progress games
    await pool.query(
      'UPDATE games SET game_status = $1 WHERE game_status = $2',
      ['abandoned', 'in_progress']
    );

    // Create new game
    const result = await pool.query(
      `INSERT INTO games (current_player, game_status, turn_number, blocked_squares)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      ['red', 'in_progress', 0, JSON.stringify([])]
    );

    res.json({ game: result.rows[0], message: 'New game created' });
  } catch (error) {
    console.error('Error creating new game:', error);
    res.status(500).json({ error: 'Failed to create new game' });
  }
};

// Make a move
const makeMove = async (req, res) => {
  const { player, x, y } = req.body;

  if (!player || x === undefined || y === undefined) {
    return res.status(400).json({ error: 'Missing required fields: player, x, y' });
  }

  if (player !== 'red' && player !== 'blue') {
    return res.status(400).json({ error: 'Player must be "red" or "blue"' });
  }

  try {
    // Get current game
    const gameResult = await pool.query(
      'SELECT * FROM games WHERE game_status = $1 ORDER BY updated_at DESC LIMIT 1',
      ['in_progress']
    );

    if (gameResult.rows.length === 0) {
      return res.status(404).json({ error: 'No active game found' });
    }

    const gameState = gameResult.rows[0];

    // Validate the move
    const validation = validateMove(gameState, player, x, y);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Add current position to blocked squares (if not first placement)
    const blockedSquares = gameState.blocked_squares || [];
    if (gameState.turn_number >= 2) {
      const currentX = player === 'red' ? gameState.red_position_x : gameState.blue_position_x;
      const currentY = player === 'red' ? gameState.red_position_y : gameState.blue_position_y;

      if (currentX !== null && currentY !== null) {
        blockedSquares.push({ x: currentX, y: currentY, player });
      }
    }

    // Update game state
    const nextPlayer = player === 'red' ? 'blue' : 'red';
    const turnNumber = gameState.turn_number + 1;

    let updateQuery, updateParams;

    if (player === 'red') {
      updateQuery = `
        UPDATE games
        SET red_position_x = $1, red_position_y = $2,
            current_player = $3, turn_number = $4,
            blocked_squares = $5, updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *
      `;
      updateParams = [x, y, nextPlayer, turnNumber, JSON.stringify(blockedSquares), gameState.id];
    } else {
      updateQuery = `
        UPDATE games
        SET blue_position_x = $1, blue_position_y = $2,
            current_player = $3, turn_number = $4,
            blocked_squares = $5, updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *
      `;
      updateParams = [x, y, nextPlayer, turnNumber, JSON.stringify(blockedSquares), gameState.id];
    }

    const updateResult = await pool.query(updateQuery, updateParams);
    const updatedGame = updateResult.rows[0];

    // Check win condition
    const winCheck = checkWinCondition(
      player,
      player === 'red' ? x : updatedGame.red_position_x,
      player === 'red' ? y : updatedGame.red_position_y,
      player === 'blue' ? x : updatedGame.blue_position_x,
      player === 'blue' ? y : updatedGame.blue_position_y,
      blockedSquares
    );

    if (winCheck) {
      // Update game status
      const gameStatus = winCheck.winner === 'red' ? 'red_wins' : 'blue_wins';
      await pool.query(
        'UPDATE games SET game_status = $1 WHERE id = $2',
        [gameStatus, updatedGame.id]
      );

      // Update scores
      const scoreField = winCheck.winner === 'red' ? 'red_wins' : 'blue_wins';
      await pool.query(
        `UPDATE scores SET ${scoreField} = ${scoreField} + 1, total_games = total_games + 1, updated_at = CURRENT_TIMESTAMP`
      );

      // Add to game history
      await pool.query(
        'INSERT INTO game_history (game_id, winner, total_turns) VALUES ($1, $2, $3)',
        [updatedGame.id, winCheck.winner, turnNumber]
      );

      // Get final game state
      const finalGame = await pool.query('SELECT * FROM games WHERE id = $1', [updatedGame.id]);

      return res.json({
        game: finalGame.rows[0],
        winner: winCheck.winner,
        reason: winCheck.reason,
        message: `${winCheck.winner} wins by ${winCheck.reason}!`
      });
    }

    res.json({ game: updatedGame, message: 'Move successful' });
  } catch (error) {
    console.error('Error making move:', error);
    res.status(500).json({ error: 'Failed to make move' });
  }
};

// Get scores
const getScores = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM scores LIMIT 1');
    res.json({ scores: result.rows[0] || { red_wins: 0, blue_wins: 0, total_games: 0 } });
  } catch (error) {
    console.error('Error getting scores:', error);
    res.status(500).json({ error: 'Failed to get scores' });
  }
};

module.exports = {
  getCurrentGame,
  createNewGame,
  makeMove,
  getScores
};
