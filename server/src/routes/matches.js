const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { calculateEloChange, getTier } = require('../services/eloService');

// GET /api/matches - Retrieve match history
router.get('/', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const matches = db.prepare(`
      SELECT m.*,
        pA1.name as team_a_p1_name, pA1.avatar_color as team_a_p1_color,
        pA2.name as team_a_p2_name, pA2.avatar_color as team_a_p2_color,
        pB1.name as team_b_p1_name, pB1.avatar_color as team_b_p1_color,
        pB2.name as team_b_p2_name, pB2.avatar_color as team_b_p2_color
      FROM matches m
      LEFT JOIN players pA1 ON m.team_a_p1_id = pA1.id
      LEFT JOIN players pA2 ON m.team_a_p2_id = pA2.id
      LEFT JOIN players pB1 ON m.team_b_p1_id = pB1.id
      LEFT JOIN players pB2 ON m.team_b_p2_id = pB2.id
      ORDER BY m.created_at DESC
      LIMIT ?
    `).all(limit);

    res.json(matches.map(m => ({
      ...m,
      games_data: JSON.parse(m.games_data)
    })));
  } catch (err) {
    console.error('Error fetching matches:', err);
    res.status(500).json({ error: 'Failed to fetch match history' });
  }
});

// POST /api/matches - Submit a completed match and calculate Elo
router.post('/', (req, res) => {
  try {
    const {
      match_mode,
      team_a_p1_id,
      team_a_p2_id,
      team_b_p1_id,
      team_b_p2_id,
      winner_team,
      team_a_games_won,
      team_b_games_won,
      games_data
    } = req.body;

    if (!match_mode || !winner_team || !team_a_p1_id || !team_b_p1_id) {
      return res.status(400).json({ error: 'Missing required match details' });
    }

    if (match_mode === 'doubles' && (!team_a_p2_id || !team_b_p2_id)) {
      return res.status(400).json({ error: 'Doubles match requires 2 players per team' });
    }

    const ratingColumn = match_mode === 'doubles' ? 'doubles_rating' : 'singles_rating';
    const winsColumn = match_mode === 'doubles' ? 'doubles_wins' : 'singles_wins';
    const lossesColumn = match_mode === 'doubles' ? 'doubles_losses' : 'singles_losses';
    const highestRatingCol = match_mode === 'doubles' ? 'highest_doubles_rating' : 'highest_singles_rating';

    // Fetch players
    const pA1 = db.prepare('SELECT * FROM players WHERE id = ?').get(team_a_p1_id);
    const pB1 = db.prepare('SELECT * FROM players WHERE id = ?').get(team_b_p1_id);
    const pA2 = team_a_p2_id ? db.prepare('SELECT * FROM players WHERE id = ?').get(team_a_p2_id) : null;
    const pB2 = team_b_p2_id ? db.prepare('SELECT * FROM players WHERE id = ?').get(team_b_p2_id) : null;

    if (!pA1 || !pB1 || (match_mode === 'doubles' && (!pA2 || !pB2))) {
      return res.status(404).json({ error: 'One or more players not found' });
    }

    const teamAPlayers = match_mode === 'doubles' ? [pA1, pA2] : [pA1];
    const teamBPlayers = match_mode === 'doubles' ? [pB1, pB2] : [pB1];

    // Compute point difference
    let totalScoreA = 0;
    let totalScoreB = 0;
    const gamesArr = Array.isArray(games_data) ? games_data : JSON.parse(games_data || '[]');
    gamesArr.forEach(g => {
      totalScoreA += g.scoreA || 0;
      totalScoreB += g.scoreB || 0;
    });

    const scoreDiff = Math.abs(totalScoreA - totalScoreB);

    // Compute Elo delta
    const eloResult = calculateEloChange({
      mode: match_mode,
      teamAPlayers,
      teamBPlayers,
      winnerTeam: winner_team,
      scoreDiff
    });

    const deltaA = eloResult.deltaA;
    const deltaB = eloResult.deltaB;

    // Execute atomic transaction for match insertion and rating updates
    const executeMatchTransaction = db.transaction(() => {
      // 1. Insert Match
      const insertMatch = db.prepare(`
        INSERT INTO matches (
          match_mode, team_a_p1_id, team_a_p2_id, team_b_p1_id, team_b_p2_id,
          winner_team, team_a_games_won, team_b_games_won, games_data,
          rating_delta_a, rating_delta_b
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const matchInsertResult = insertMatch.run(
        match_mode,
        team_a_p1_id,
        team_a_p2_id || null,
        team_b_p1_id,
        team_b_p2_id || null,
        winner_team,
        team_a_games_won || 0,
        team_b_games_won || 0,
        JSON.stringify(gamesArr),
        deltaA,
        deltaB
      );

      const matchId = matchInsertResult.lastInsertRowid;

      // Helper function to update each player
      const updatePlayer = (player, delta, won) => {
        const oldRating = player[ratingColumn];
        const newRating = Math.max(100, oldRating + delta);
        const newHighest = Math.max(player[highestRatingCol] || 1200, newRating);
        const newStreak = won ? (player.current_streak > 0 ? player.current_streak + 1 : 1)
                              : (player.current_streak < 0 ? player.current_streak - 1 : -1);

        db.prepare(`
          UPDATE players
          SET ${ratingColumn} = ?,
              ${won ? winsColumn : lossesColumn} = ${won ? winsColumn : lossesColumn} + 1,
              ${highestRatingCol} = ?,
              current_streak = ?
          WHERE id = ?
        `).run(newRating, newHighest, newStreak, player.id);

        db.prepare(`
          INSERT INTO rating_history (player_id, match_id, match_mode, old_rating, new_rating, delta)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(player.id, matchId, match_mode, oldRating, newRating, delta);

        return {
          id: player.id,
          name: player.name,
          oldRating,
          newRating,
          delta,
          tier: getTier(newRating)
        };
      };

      const updatedTeamA = teamAPlayers.map(p => updatePlayer(p, deltaA, winner_team === 'A'));
      const updatedTeamB = teamBPlayers.map(p => updatePlayer(p, deltaB, winner_team === 'B'));

      return {
        matchId,
        matchMode: match_mode,
        winnerTeam: winner_team,
        deltaA,
        deltaB,
        updatedTeamA,
        updatedTeamB
      };
    });

    const result = executeMatchTransaction();
    res.status(201).json(result);
  } catch (err) {
    console.error('Error recording match:', err);
    res.status(500).json({ error: 'Failed to record match and calculate ratings' });
  }
});

module.exports = router;
