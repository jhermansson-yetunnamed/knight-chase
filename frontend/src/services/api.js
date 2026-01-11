const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export const gameAPI = {
  getCurrentGame: async () => {
    const response = await fetch(`${API_BASE_URL}/game/current`);
    if (!response.ok) throw new Error('Failed to fetch current game');
    return response.json();
  },

  createNewGame: async () => {
    const response = await fetch(`${API_BASE_URL}/game/new`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to create new game');
    return response.json();
  },

  makeMove: async (player, x, y) => {
    const response = await fetch(`${API_BASE_URL}/game/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player, x, y }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to make move');
    }
    return response.json();
  },

  getScores: async () => {
    const response = await fetch(`${API_BASE_URL}/game/scores`);
    if (!response.ok) throw new Error('Failed to fetch scores');
    return response.json();
  },
};
