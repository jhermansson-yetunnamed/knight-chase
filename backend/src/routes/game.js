const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// Get current game state
router.get('/current', gameController.getCurrentGame);

// Create new game
router.post('/new', gameController.createNewGame);

// Make a move
router.post('/move', gameController.makeMove);

// Get scores
router.get('/scores', gameController.getScores);

module.exports = router;
