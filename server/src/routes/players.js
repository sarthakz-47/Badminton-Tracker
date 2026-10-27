const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { getTier } = require('../services/eloService');

// GET /api/players - List all players with computed stats
router.get('/', (req, res) => {
  try {
    const players = db.prepare(`
      SELECT * FROM players ORDER BY (singles_rating + doubles_rating) / 2 DESC
    `).all();

    const formatted = players.map(p => {
      const singlesTotal = p.singles_wins + p.singles_losses;
      const doublesTotal = p.doubles_wins + p.doubles_losses;
      const singlesWinRate = singlesTotal > 0 ? Math.round((p.singles_wins / singlesTotal) * 100) : 0;
      const doublesWinRate = doublesTotal > 0 ? Math.round((p.doubles_wins / doublesTotal) * 100) : 0;

      return {
        ...p,
        singles_win_rate: singlesWinRate,
        doubles_win_rate: doublesWinRate,
        singles_tier: getTier(p.singles_rating),
        doubles_tier: getTier(p.doubles_rating)
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching players:', err);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

// POST /api/players - Create a new player with custom ratings & stats
router.post('/', (req, res) => {
  try {
    const {
      name,
      singles_rating,
      doubles_rating,
      singles_wins,
      singles_losses,
      doubles_wins,
      doubles_losses,
      avatar_color
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Player name is required' });
    }

    const trimmedName = name.trim();
    const sRating = parseInt(singles_rating) || 1200;
    const dRating = parseInt(doubles_rating) || 1200;
    const sWins = parseInt(singles_wins) || 0;
    const sLosses = parseInt(singles_losses) || 0;
    const dWins = parseInt(doubles_wins) || 0;
    const dLosses = parseInt(doubles_losses) || 0;
    const color = avatar_color || '#10B981';

    const insert = db.prepare(`
      INSERT INTO players (
        name, singles_rating, doubles_rating,
        singles_wins, singles_losses, doubles_wins, doubles_losses,
        highest_singles_rating, highest_doubles_rating, avatar_color
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      trimmedName, sRating, dRating,
      sWins, sLosses, dWins, dLosses,
      sRating, dRating, color
    );
    const newPlayer = db.prepare('SELECT * FROM players WHERE id = ?').get(result.lastInsertRowid);

    const sTotal = sWins + sLosses;
    const dTotal = dWins + dLosses;

    res.status(201).json({
      ...newPlayer,
      singles_win_rate: sTotal > 0 ? Math.round((sWins / sTotal) * 100) : 0,
      doubles_win_rate: dTotal > 0 ? Math.round((dWins / dTotal) * 100) : 0,
      singles_tier: getTier(sRating),
      doubles_tier: getTier(dRating)
    });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'A player with this name already exists' });
    }
    console.error('Error creating player:', err);
    res.status(500).json({ error: 'Failed to create player' });
  }
});

// PUT /api/players/:id - Edit an existing player (name, ratings, record)
router.put('/:id', (req, res) => {
  try {
    const playerId = req.params.id;
    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const {
      name,
      singles_rating,
      doubles_rating,
      singles_wins,
      singles_losses,
      doubles_wins,
      doubles_losses,
      avatar_color
    } = req.body;

    const trimmedName = name ? name.trim() : player.name;
    const sRating = singles_rating !== undefined ? parseInt(singles_rating) : player.singles_rating;
    const dRating = doubles_rating !== undefined ? parseInt(doubles_rating) : player.doubles_rating;
    const sWins = singles_wins !== undefined ? parseInt(singles_wins) : player.singles_wins;
    const sLosses = singles_losses !== undefined ? parseInt(singles_losses) : player.singles_losses;
    const dWins = doubles_wins !== undefined ? parseInt(doubles_wins) : player.doubles_wins;
    const dLosses = doubles_losses !== undefined ? parseInt(doubles_losses) : player.doubles_losses;
    const highestS = Math.max(player.highest_singles_rating || 1200, sRating);
    const highestD = Math.max(player.highest_doubles_rating || 1200, dRating);
    const color = avatar_color || player.avatar_color;

    db.prepare(`
      UPDATE players
      SET name = ?,
          singles_rating = ?,
          doubles_rating = ?,
          singles_wins = ?,
          singles_losses = ?,
          doubles_wins = ?,
          doubles_losses = ?,
          highest_singles_rating = ?,
          highest_doubles_rating = ?,
          avatar_color = ?
      WHERE id = ?
    `).run(trimmedName, sRating, dRating, sWins, sLosses, dWins, dLosses, highestS, highestD, color, playerId);

    const updated = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);
    const sTotal = sWins + sLosses;
    const dTotal = dWins + dLosses;

    res.json({
      ...updated,
      singles_win_rate: sTotal > 0 ? Math.round((sWins / sTotal) * 100) : 0,
      doubles_win_rate: dTotal > 0 ? Math.round((dWins / dTotal) * 100) : 0,
      singles_tier: getTier(sRating),
      doubles_tier: getTier(dRating)
    });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'A player with this name already exists' });
    }
    console.error('Error updating player:', err);
    res.status(500).json({ error: 'Failed to update player' });
  }
});


// GET /api/players/:id - Detailed player profile with history & recent matches
router.get('/:id', (req, res) => {
  try {
    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Rating history for charts
    const history = db.prepare(`
      SELECT * FROM rating_history
      WHERE player_id = ?
      ORDER BY created_at ASC
    `).all(req.params.id);

    // Recent matches involving this player
    const recentMatches = db.prepare(`
      SELECT m.*,
        pA1.name as team_a_p1_name, pA2.name as team_a_p2_name,
        pB1.name as team_b_p1_name, pB2.name as team_b_p2_name
      FROM matches m
      LEFT JOIN players pA1 ON m.team_a_p1_id = pA1.id
      LEFT JOIN players pA2 ON m.team_a_p2_id = pA2.id
      LEFT JOIN players pB1 ON m.team_b_p1_id = pB1.id
      LEFT JOIN players pB2 ON m.team_b_p2_id = pB2.id
      WHERE m.team_a_p1_id = ? OR m.team_a_p2_id = ? OR m.team_b_p1_id = ? OR m.team_b_p2_id = ?
      ORDER BY m.created_at DESC
      LIMIT 15
    `).all(req.params.id, req.params.id, req.params.id, req.params.id);

    const singlesTotal = player.singles_wins + player.singles_losses;
    const doublesTotal = player.doubles_wins + player.doubles_losses;

    res.json({
      ...player,
      singles_win_rate: singlesTotal > 0 ? Math.round((player.singles_wins / singlesTotal) * 100) : 0,
      doubles_win_rate: doublesTotal > 0 ? Math.round((player.doubles_wins / doublesTotal) * 100) : 0,
      singles_tier: getTier(player.singles_rating),
      doubles_tier: getTier(player.doubles_rating),
      history,
      recentMatches: recentMatches.map(m => ({
        ...m,
        games_data: JSON.parse(m.games_data)
      }))
    });
  } catch (err) {
    console.error('Error fetching player detail:', err);
    res.status(500).json({ error: 'Failed to fetch player profile' });
  }
});

// GET /api/players/:id/h2h/:opponentId - Head to head stats
router.get('/:id/h2h/:opponentId', (req, res) => {
  try {
    const p1Id = req.params.id;
    const p2Id = req.params.opponentId;

    const matches = db.prepare(`
      SELECT m.*,
        pA1.name as team_a_p1_name, pA2.name as team_a_p2_name,
        pB1.name as team_b_p1_name, pB2.name as team_b_p2_name
      FROM matches m
      LEFT JOIN players pA1 ON m.team_a_p1_id = pA1.id
      LEFT JOIN players pA2 ON m.team_a_p2_id = pA2.id
      LEFT JOIN players pB1 ON m.team_b_p1_id = pB1.id
      LEFT JOIN players pB2 ON m.team_b_p2_id = pB2.id
      WHERE ((m.team_a_p1_id = ? OR m.team_a_p2_id = ?) AND (m.team_b_p1_id = ? OR m.team_b_p2_id = ?))
         OR ((m.team_a_p1_id = ? OR m.team_a_p2_id = ?) AND (m.team_b_p1_id = ? OR m.team_b_p2_id = ?))
      ORDER BY m.created_at DESC
    `).all(p1Id, p1Id, p2Id, p2Id, p2Id, p2Id, p1Id, p1Id);

    let p1Wins = 0;
    let p2Wins = 0;

    matches.forEach(m => {
      const p1InTeamA = m.team_a_p1_id == p1Id || m.team_a_p2_id == p1Id;
      if ((p1InTeamA && m.winner_team === 'A') || (!p1InTeamA && m.winner_team === 'B')) {
        p1Wins++;
      } else {
        p2Wins++;
      }
    });

    res.json({
      totalMatches: matches.length,
      p1Wins,
      p2Wins,
      matches: matches.map(m => ({
        ...m,
        games_data: JSON.parse(m.games_data)
      }))
    });
  } catch (err) {
    console.error('Error calculating H2H:', err);
    res.status(500).json({ error: 'Failed to compute head-to-head' });
  }
});

// DELETE /api/players/:id - Delete a player and clean up associated records
router.delete('/:id', (req, res) => {
  try {
    const playerId = req.params.id;
    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const deleteTransaction = db.transaction(() => {
      // Find matches involving this player
      const matches = db.prepare(`
        SELECT id FROM matches 
        WHERE team_a_p1_id = ? OR team_a_p2_id = ? OR team_b_p1_id = ? OR team_b_p2_id = ?
      `).all(playerId, playerId, playerId, playerId);

      const matchIds = matches.map(m => m.id);
      if (matchIds.length > 0) {
        const deleteHistory = db.prepare('DELETE FROM rating_history WHERE match_id = ?');
        for (const mId of matchIds) {
          deleteHistory.run(mId);
        }
        const deleteMatch = db.prepare('DELETE FROM matches WHERE id = ?');
        for (const mId of matchIds) {
          deleteMatch.run(mId);
        }
      }

      // Delete rating_history for this player directly
      db.prepare('DELETE FROM rating_history WHERE player_id = ?').run(playerId);

      // Finally delete the player
      db.prepare('DELETE FROM players WHERE id = ?').run(playerId);
    });

    deleteTransaction();
    res.json({ success: true, message: `Player "${player.name}" deleted successfully` });
  } catch (err) {
    console.error('Error deleting player:', err);
    res.status(500).json({ error: 'Failed to delete player' });
  }
});

module.exports = router;

