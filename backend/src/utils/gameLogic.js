// Knight Chase Game Logic

// Knight's move: 2 squares in one direction + 1 perpendicular
const KNIGHT_MOVES = [
  { dx: 2, dy: 1 },
  { dx: 2, dy: -1 },
  { dx: -2, dy: 1 },
  { dx: -2, dy: -1 },
  { dx: 1, dy: 2 },
  { dx: 1, dy: -2 },
  { dx: -1, dy: 2 },
  { dx: -1, dy: -2 }
];

function isValidPosition(x, y) {
  return x >= 0 && x < 8 && y >= 0 && y < 8;
}

function isKnightMove(fromX, fromY, toX, toY) {
  const dx = toX - fromX;
  const dy = toY - fromY;

  return KNIGHT_MOVES.some(move => move.dx === dx && move.dy === dy);
}

function isSquareBlocked(x, y, blockedSquares) {
  return blockedSquares.some(square => square.x === x && square.y === y);
}

function getValidMoves(fromX, fromY, blockedSquares, opponentX, opponentY) {
  const validMoves = [];

  for (const move of KNIGHT_MOVES) {
    const newX = fromX + move.dx;
    const newY = fromY + move.dy;

    // Check if within board
    if (!isValidPosition(newX, newY)) continue;

    // Check if not blocked (but allow landing on opponent)
    if (isSquareBlocked(newX, newY, blockedSquares)) continue;

    // This is a valid move
    validMoves.push({ x: newX, y: newY });
  }

  return validMoves;
}

function checkWinCondition(player, playerX, playerY, opponentX, opponentY, blockedSquares) {
  // Win by capture: player's position equals opponent's position
  if (playerX === opponentX && playerY === opponentY) {
    return { winner: player, reason: 'capture' };
  }

  // Win by blocking: opponent has no valid moves
  const opponentValidMoves = getValidMoves(opponentX, opponentY, blockedSquares, playerX, playerY);
  if (opponentValidMoves.length === 0) {
    return { winner: player, reason: 'blocked' };
  }

  return null;
}

function validateMove(gameState, player, toX, toY) {
  // Check if it's the player's turn
  if (gameState.current_player !== player) {
    return { valid: false, error: 'Not your turn' };
  }

  // Get player's current position
  const fromX = player === 'red' ? gameState.red_position_x : gameState.blue_position_x;
  const fromY = player === 'red' ? gameState.red_position_y : gameState.blue_position_y;

  // On first turn (turn 0-1), can place anywhere
  if (gameState.turn_number < 2) {
    if (!isValidPosition(toX, toY)) {
      return { valid: false, error: 'Position out of bounds' };
    }
    if (isSquareBlocked(toX, toY, gameState.blocked_squares)) {
      return { valid: false, error: 'Square is blocked' };
    }
    return { valid: true };
  }

  // After first turn, must use knight's move
  if (!isKnightMove(fromX, fromY, toX, toY)) {
    return { valid: false, error: 'Must use knight\'s move (L-shape)' };
  }

  if (!isValidPosition(toX, toY)) {
    return { valid: false, error: 'Position out of bounds' };
  }

  if (isSquareBlocked(toX, toY, gameState.blocked_squares)) {
    return { valid: false, error: 'Square is blocked' };
  }

  return { valid: true };
}

module.exports = {
  isValidPosition,
  isKnightMove,
  isSquareBlocked,
  getValidMoves,
  checkWinCondition,
  validateMove,
  KNIGHT_MOVES
};
