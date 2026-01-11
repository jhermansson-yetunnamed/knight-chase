import React, { useState, useEffect } from 'react';
import GameBoard from './GameBoard';
import { gameAPI } from '../services/api';

const Game = () => {
  const [game, setGame] = useState(null);
  const [scores, setScores] = useState({ red_wins: 0, blue_wins: 0, total_games: 0 });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGame();
    loadScores();
  }, []);

  const loadGame = async () => {
    try {
      setLoading(true);
      const data = await gameAPI.getCurrentGame();
      setGame(data.game);
      if (!data.game) {
        setMessage('No active game. Click "New Game" to start!');
      } else if (data.winner) {
        // Game ended due to blocking
        setMessage(`🎉 ${data.winner.toUpperCase()} WINS! ${data.message}`);
        await loadScores();
      } else {
        setMessage('');
      }
    } catch (err) {
      setError('Failed to load game: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadScores = async () => {
    try {
      const data = await gameAPI.getScores();
      setScores(data.scores);
    } catch (err) {
      console.error('Failed to load scores:', err);
    }
  };

  const handleNewGame = async () => {
    try {
      setError('');
      const data = await gameAPI.createNewGame();
      setGame(data.game);
      setMessage(data.message);
      await loadScores();
    } catch (err) {
      setError('Failed to create new game: ' + err.message);
    }
  };

  const handleSquareClick = async (x, y) => {
    if (!game || game.game_status !== 'in_progress') return;

    try {
      setError('');
      setMessage('');
      const data = await gameAPI.makeMove(game.current_player, x, y);
      setGame(data.game);

      if (data.winner) {
        const reasonText = data.reason === 'capture' ? 'capturing opponent' : 'blocking opponent (no valid moves)';
        setMessage(`🎉 ${data.winner.toUpperCase()} WINS by ${reasonText}!`);
        await loadScores();
      } else {
        setMessage(data.message);
        // After move completes, check if next player is blocked
        setTimeout(async () => {
          const checkData = await gameAPI.getCurrentGame();
          if (checkData.winner && checkData.game.game_status !== 'in_progress') {
            setGame(checkData.game);
            setMessage(`🎉 ${checkData.winner.toUpperCase()} WINS! ${checkData.message}`);
            await loadScores();
          }
        }, 100);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 mb-2">
            Knight Chase
          </h1>
          <p className="text-gray-400 text-lg">Strategic Chess-Inspired Battle</p>
        </div>

        {/* Score Board */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold text-center mb-4 text-gray-200">Score Board</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-red-900/30 rounded-lg p-4 border border-red-600">
              <div className="text-red-500 text-xl font-bold mb-1">Red</div>
              <div className="text-4xl font-bold text-white">{scores.red_wins}</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-500">
              <div className="text-gray-400 text-xl font-bold mb-1">Total</div>
              <div className="text-4xl font-bold text-white">{scores.total_games}</div>
            </div>
            <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-600">
              <div className="text-blue-500 text-xl font-bold mb-1">Blue</div>
              <div className="text-4xl font-bold text-white">{scores.blue_wins}</div>
            </div>
          </div>
        </div>

        {/* Game Status and Controls */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex-1 text-center md:text-left">
              {game && game.game_status === 'in_progress' && (
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <span className="text-xl text-gray-300">Current Turn:</span>
                  <span className={`text-3xl font-bold ${game.current_player === 'red' ? 'text-red-500' : 'text-blue-500'}`}>
                    {game.current_player.toUpperCase()}
                  </span>
                  <span className={`w-4 h-4 rounded-full ${game.current_player === 'red' ? 'bg-red-500' : 'bg-blue-500'} animate-pulse`}></span>
                </div>
              )}
              {game && game.game_status !== 'in_progress' && (
                <div className="text-xl text-gray-300">
                  Game Over - <span className="font-bold text-yellow-400">{game.game_status.replace('_', ' ').toUpperCase()}</span>
                </div>
              )}
              {!game && (
                <div className="text-xl text-gray-400">No active game</div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleNewGame}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg transform hover:scale-105"
              >
                New Game
              </button>
              <button
                onClick={loadGame}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg transform hover:scale-105"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Messages */}
          {message && (
            <div className="mt-4 p-3 bg-green-900/30 border border-green-600 rounded-lg text-green-300 text-center">
              {message}
            </div>
          )}
          {error && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-600 rounded-lg text-red-300 text-center">
              {error}
            </div>
          )}
        </div>

        {/* Game Board */}
        <div className="flex justify-center">
          {game ? (
            <GameBoard game={game} onSquareClick={handleSquareClick} />
          ) : (
            <div className="bg-gray-800 rounded-lg p-12 text-center">
              <p className="text-2xl text-gray-400 mb-4">No game in progress</p>
              <p className="text-gray-500">Click "New Game" to start playing!</p>
            </div>
          )}
        </div>

        {/* Game Rules */}
        <div className="mt-8 bg-gray-800 rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-200">How to Play</h2>
          <div className="grid md:grid-cols-2 gap-4 text-gray-300">
            <div>
              <h3 className="font-semibold text-lg mb-2 text-red-400">Basic Rules:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Red player goes first, then Blue</li>
                <li>First turn: place your dot anywhere on the board</li>
                <li>After first turn: move using knight's L-shape move</li>
                <li>Your previous positions become blocked (marked with ×)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 text-blue-400">Win Conditions:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Capture:</strong> Land on your opponent's square</li>
                <li><strong>Block:</strong> Leave your opponent with no valid moves</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-purple-900/20 border border-purple-500 rounded text-sm text-gray-300">
            <strong className="text-purple-400">Knight's Move:</strong> Move 2 squares in one direction, then 1 square perpendicular (L-shape)
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
