/**
 * Elo Rating Service for Badminton (Singles and Doubles)
 */

function getKFactor(matchesPlayed) {
  if (matchesPlayed < 10) return 32; // Placement calibration
  if (matchesPlayed < 30) return 24;
  return 20;
}

function getTier(rating) {
  if (rating >= 1700) return { name: 'Smash Elite', badge: '👑', color: '#F59E0B' };
  if (rating >= 1500) return { name: 'Master', badge: '💎', color: '#8B5CF6' };
  if (rating >= 1300) return { name: 'Advanced', badge: '🥇', color: '#10B981' };
  if (rating >= 1100) return { name: 'Club Player', badge: '🥈', color: '#06B6D4' };
  return { name: 'Novice', badge: '🥉', color: '#94A3B8' };
}

/**
 * Calculates rating changes for a completed match
 * @param {Object} matchData
 * @param {string} matchData.mode 'singles' or 'doubles'
 * @param {Array<Object>} matchData.teamAPlayers Array of player objects with current rating and match count
 * @param {Array<Object>} matchData.teamBPlayers Array of player objects with current rating and match count
 * @param {string} matchData.winnerTeam 'A' or 'B'
 * @param {number} matchData.scoreDiff Total point difference between winner and loser
 */
function calculateEloChange({ mode, teamAPlayers, teamBPlayers, winnerTeam, scoreDiff = 0 }) {
  const ratingKey = mode === 'doubles' ? 'doubles_rating' : 'singles_rating';

  // Calculate average team rating
  const teamARating = teamAPlayers.reduce((sum, p) => sum + (p[ratingKey] || 1200), 0) / teamAPlayers.length;
  const teamBRating = teamBPlayers.reduce((sum, p) => sum + (p[ratingKey] || 1200), 0) / teamBPlayers.length;

  // Expected scores
  const expectedA = 1 / (1 + Math.pow(10, (teamBRating - teamARating) / 400));
  const expectedB = 1 - expectedA;

  // Actual outcome
  const actualA = winnerTeam === 'A' ? 1 : 0;

  // Margin of victory multiplier (between 1.0 and 1.5)
  const marginMultiplier = Math.min(1.5, Math.max(1.0, 1 + (scoreDiff / 30)));

  // Calculate dynamic K factor (average of players)
  const allPlayers = [...teamAPlayers, ...teamBPlayers];
  const avgMatches = allPlayers.reduce((sum, p) => {
    const wins = mode === 'doubles' ? (p.doubles_wins || 0) : (p.singles_wins || 0);
    const losses = mode === 'doubles' ? (p.doubles_losses || 0) : (p.singles_losses || 0);
    return sum + wins + losses;
  }, 0) / allPlayers.length;

  const K = getKFactor(avgMatches);

  // Delta calculation
  let rawDeltaA = Math.round(K * (actualA - expectedA) * marginMultiplier);

  // Ensure minimum delta of 4 points on win/loss to prevent 0-point wins
  if (winnerTeam === 'A' && rawDeltaA < 4) rawDeltaA = 4;
  if (winnerTeam === 'B' && rawDeltaA > -4) rawDeltaA = -4;

  const deltaA = rawDeltaA;
  const deltaB = -rawDeltaA;

  return {
    deltaA,
    deltaB,
    expectedA: Math.round(expectedA * 100),
    expectedB: Math.round(expectedB * 100),
    teamARating: Math.round(teamARating),
    teamBRating: Math.round(teamBRating)
  };
}

module.exports = {
  calculateEloChange,
  getTier,
  getKFactor
};
