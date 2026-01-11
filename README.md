# Knight Chase

A strategic two-player board game inspired by chess knight movements.

## Game Rules

- 8x8 chessboard grid
- Two players: Red and Blue
- **First turn**: Place your piece anywhere on the board
- **Subsequent turns**: Move using knight's L-shape move (2 squares + 1 perpendicular)
- Previous positions become blocked (marked with ×)
- **Win by**: Capturing opponent's piece OR blocking them with no valid moves

## Tech Stack

- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL

### Setup

1. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
node src/config/setupDatabase.js
npm start
```

2. **Frontend Setup**
```bash
cd frontend
npm install
npm start
```

The game will be available at http://localhost:3000

## Deployment

This app is configured for deployment on Render.com with:
- Backend API service
- PostgreSQL database
- Static site for frontend

## Author

Created by jhermansson-yetunnamed
