const express = require('express');
const cors = require('cors');
require('dotenv').config();

const playersRouter = require('./routes/players');
const matchesRouter = require('./routes/matches');
const leaderboardRouter = require('./routes/leaderboard');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/players', playersRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/leaderboard', leaderboardRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Badminton Score & Rating API', timestamp: new Date().toISOString() });
});

// Serve frontend build in production
const path = require('path');
const fs = require('fs');
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🏸 Badminton API Server running on http://localhost:${PORT}`);
});
