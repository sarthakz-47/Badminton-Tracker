const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { getTier } = require('../services/eloService');

// GET /api/leaderboard?mode=singles|doubles|all
router.get('/', (req, res) => {
  try {
    const mode = req.query.mode || 'all';

    let orderBy = '(singles_rating + doubles_rating) / 2';
    if (mode === 'singles') orderBy = 'singles_rating';
    if (mode === 'doubles') orderBy = 'doubles_rating';

    const players = db.prepare(`
      SELECT * FROM players ORDER BY ${orderBy} DESC
    `).all();

    // Helper to get last 5 matches form for a player
    const getFormStmt = db.prepare(`
      SELECT rh.delta
      FROM rating_history rh
      WHERE rh.player_id = ? ${mode !== 'all' ? 'AND rh.match_mode = ?' : ''}
      ORDER BY rh.created_at DESC
      LIMIT 5
    `);

    const leaderboard = players.map((p, idx) => {
      const activeRating = mode === 'singles' 
        ? p.singles_rating 
        : mode === 'doubles' 
          ? p.doubles_rating 
          : Math.round((p.singles_rating + p.doubles_rating) / 2);

      const wins = mode === 'singles' 
        ? p.singles_wins 
        : mode === 'doubles' 
          ? p.doubles_wins 
          : (p.singles_wins + p.doubles_wins);

      const losses = mode === 'singles' 
        ? p.singles_losses 
        : mode === 'doubles' 
          ? p.doubles_losses 
          : (p.singles_losses + p.doubles_losses);

      const total = wins + losses;
      const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

      const historyRows = mode !== 'all'
        ? getFormStmt.all(p.id, mode)
        : getFormStmt.all(p.id);

      const form = historyRows.map(r => (r.delta > 0 ? 'W' : 'L')).reverse();

      return {
        rank: idx + 1,
        id: p.id,
        name: p.name,
        avatar_color: p.avatar_color,
        rating: activeRating,
        tier: getTier(activeRating),
        singles_rating: p.singles_rating,
        doubles_rating: p.doubles_rating,
        wins,
        losses,
        matches_played: total,
        win_rate: winRate,
        current_streak: p.current_streak,
        highest_rating: mode === 'singles' ? p.highest_singles_rating : p.highest_doubles_rating,
        form: form.length > 0 ? form : ['-']
      };
    });

    res.json(leaderboard);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// GET /api/leaderboard/overview - Quick stats for top of page
router.get('/overview', (req, res) => {
  try {
    const playerCount = db.prepare('SELECT COUNT(*) as count FROM players').get().count;
    const matchCount = db.prepare('SELECT COUNT(*) as count FROM matches').get().count;
    const topSingles = db.prepare('SELECT name, singles_rating FROM players ORDER BY singles_rating DESC LIMIT 1').get();
    const topDoubles = db.prepare('SELECT name, doubles_rating FROM players ORDER BY doubles_rating DESC LIMIT 1').get();

    res.json({
      playerCount,
      matchCount,
      topSingles: topSingles || { name: 'None', singles_rating: 1200 },
      topDoubles: topDoubles || { name: 'None', doubles_rating: 1200 }
    });
  } catch (err) {
    console.error('Error fetching stats overview:', err);
    res.status(500).json({ error: 'Failed to fetch overview stats' });
  }
});

module.exports = router;
