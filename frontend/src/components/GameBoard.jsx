import React from 'react';

const GameBoard = ({ game, onSquareClick }) => {
  const renderSquare = (x, y) => {
    const isLightSquare = (x + y) % 2 === 0;
    const blockedSquares = game?.blocked_squares || [];
    const isBlocked = blockedSquares.some(sq => sq.x === x && sq.y === y);

    const redX = game?.red_position_x;
    const redY = game?.red_position_y;
    const blueX = game?.blue_position_x;
    const blueY = game?.blue_position_y;

    const hasRed = redX === x && redY === y;
    const hasBlue = blueX === x && blueY === y;

    let blockedPlayer = null;
    if (isBlocked) {
      const blockedSquare = blockedSquares.find(sq => sq.x === x && sq.y === y);
      blockedPlayer = blockedSquare?.player;
    }

    return (
      <button
        key={`${x}-${y}`}
        onClick={() => onSquareClick(x, y)}
        className={`
          w-16 h-16 border border-gray-600 flex items-center justify-center text-3xl font-bold
          ${isLightSquare ? 'bg-board-light' : 'bg-board-dark'}
          hover:opacity-80 transition-opacity
          ${game?.game_status !== 'in_progress' ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
        disabled={game?.game_status !== 'in_progress'}
      >
        {hasRed && <span className="text-red-600">●</span>}
        {hasBlue && <span className="text-blue-600">●</span>}
        {isBlocked && !hasRed && !hasBlue && (
          <span className={`text-2xl ${blockedPlayer === 'red' ? 'text-red-400' : 'text-blue-400'}`}>×</span>
        )}
      </button>
    );
  };

  return (
    <div className="inline-block border-4 border-gray-800 shadow-2xl">
      <div className="grid grid-cols-8">
        {Array.from({ length: 8 }, (_, y) =>
          Array.from({ length: 8 }, (_, x) => renderSquare(x, y))
        )}
      </div>
    </div>
  );
};

export default GameBoard;
