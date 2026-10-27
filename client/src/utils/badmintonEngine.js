/**
 * Badminton Match State Machine & Rules Engine (Official BWF Rally Point System)
 */

export const MATCH_MODES = {
  SINGLES: 'singles',
  DOUBLES: 'doubles'
};

export const FORMATS = {
  BEST_OF_3: 3,
  BEST_OF_1: 1
};

/**
 * Initializes a new badminton match state
 */
export function createInitialMatchState({
  mode = MATCH_MODES.SINGLES,
  format = FORMATS.BEST_OF_3,
  targetScore = 21,
  teamA = { p1: null, p2: null, name: 'Team A' },
  teamB = { p1: null, p2: null, name: 'Team B' },
  initialServerTeam = 'A'
}) {
  const isDoubles = mode === MATCH_MODES.DOUBLES;

  return {
    mode,
    format,
    targetScore,
    teamA,
    teamB,
    // Game scores
    scoreA: 0,
    scoreB: 0,
    gamesWonA: 0,
    gamesWonB: 0,
    currentGameNumber: 1,
    completedGames: [],
    // Status
    servingTeam: initialServerTeam,
    serverPlayerId: initialServerTeam === 'A' ? teamA.p1?.id : teamB.p1?.id,
    receiverPlayerId: initialServerTeam === 'A' ? teamB.p1?.id : teamA.p1?.id,
    // Court layout: which player is in right and left service box
    // For Side A and Side B
    positionsA: {
      right: teamA.p1, // Even box
      left: isDoubles ? teamA.p2 : null // Odd box
    },
    positionsB: {
      right: teamB.p1, // Even box
      left: isDoubles ? teamB.p2 : null // Odd box
    },
    endsSwapped: false, // If true, Side A is on the right visual court side
    isInterval: false,
    intervalAcknowledged: false,
    isGameOver: false,
    isMatchOver: false,
    winnerTeam: null,
    history: [] // Stack of past snapshots for 100% undo accuracy
  };
}

/**
 * Checks if a game or match is won
 */
export function checkGameStatus(scoreA, scoreB, targetScore = 21) {
  const deuceThreshold = targetScore - 1; // 20 in 21-point game
  const maxScore = targetScore === 21 ? 30 : targetScore + 9;

  const isDeuce = scoreA >= deuceThreshold && scoreB >= deuceThreshold;
  const leadA = scoreA - scoreB;
  const leadB = scoreB - scoreA;

  let gameWinner = null;

  if (scoreA >= targetScore || scoreB >= targetScore) {
    if (scoreA === maxScore) {
      gameWinner = 'A';
    } else if (scoreB === maxScore) {
      gameWinner = 'B';
    } else if (Math.abs(leadA) >= 2) {
      gameWinner = leadA > 0 ? 'A' : 'B';
    }
  }

  // Game Point or Match Point flags
  let alert = null;
  if (!gameWinner) {
    if (scoreA >= deuceThreshold && scoreB >= deuceThreshold) {
      if (scoreA === scoreB) alert = 'Deuce!';
      else if (scoreA > scoreB) alert = 'Game Point Team A';
      else alert = 'Game Point Team B';
    } else if (scoreA === targetScore - 1) {
      alert = 'Game Point Team A';
    } else if (scoreB === targetScore - 1) {
      alert = 'Game Point Team B';
    }
  }

  return {
    gameWinner,
    isDeuce,
    alert
  };
}

/**
 * Handles scoring a point for Team A or Team B
 */
export function scorePoint(currentState, scoringTeam) {
  if (currentState.isGameOver || currentState.isMatchOver) return currentState;

  // Snapshot current state for Undo
  const snapshot = {
    scoreA: currentState.scoreA,
    scoreB: currentState.scoreB,
    gamesWonA: currentState.gamesWonA,
    gamesWonB: currentState.gamesWonB,
    currentGameNumber: currentState.currentGameNumber,
    completedGames: [...currentState.completedGames],
    servingTeam: currentState.servingTeam,
    serverPlayerId: currentState.serverPlayerId,
    receiverPlayerId: currentState.receiverPlayerId,
    positionsA: { ...currentState.positionsA },
    positionsB: { ...currentState.positionsB },
    endsSwapped: currentState.endsSwapped,
    isInterval: currentState.isInterval,
    intervalAcknowledged: currentState.intervalAcknowledged,
    isGameOver: currentState.isGameOver,
    isMatchOver: currentState.isMatchOver,
    winnerTeam: currentState.winnerTeam
  };

  const newScoreA = scoringTeam === 'A' ? currentState.scoreA + 1 : currentState.scoreA;
  const newScoreB = scoringTeam === 'B' ? currentState.scoreB + 1 : currentState.scoreB;

  const isDoubles = currentState.mode === MATCH_MODES.DOUBLES;
  const servingTeamWasScorer = currentState.servingTeam === scoringTeam;

  let newPositionsA = { ...currentState.positionsA };
  let newPositionsB = { ...currentState.positionsB };
  let newServingTeam = scoringTeam;
  let newServerPlayerId = null;
  let newReceiverPlayerId = null;

  if (isDoubles) {
    if (servingTeamWasScorer) {
      // BWF Doubles Rule: Serving team won rally -> SAME server swaps service court with partner
      if (scoringTeam === 'A') {
        const temp = newPositionsA.right;
        newPositionsA.right = newPositionsA.left;
        newPositionsA.left = temp;
        // The server is still the same player
        newServerPlayerId = currentState.serverPlayerId;
        // Receiver is the player diagonally opposite the server's new box
        const serverInRightBox = newPositionsA.right?.id === newServerPlayerId;
        newReceiverPlayerId = serverInRightBox ? newPositionsB.right?.id : newPositionsB.left?.id;
      } else {
        const temp = newPositionsB.right;
        newPositionsB.right = newPositionsB.left;
        newPositionsB.left = temp;
        newServerPlayerId = currentState.serverPlayerId;
        const serverInRightBox = newPositionsB.right?.id === newServerPlayerId;
        newReceiverPlayerId = serverInRightBox ? newPositionsA.right?.id : newPositionsA.left?.id;
      }
    } else {
      // BWF Doubles Rule: Receiving team won rally -> NO ONE swaps boxes.
      // New server is whoever is in the box matching their new score (Even = Right, Odd = Left).
      if (scoringTeam === 'A') {
        const isEven = newScoreA % 2 === 0;
        const server = isEven ? newPositionsA.right : newPositionsA.left;
        newServerPlayerId = server?.id;
        // Receiver is diagonally opposite
        const receiver = isEven ? newPositionsB.right : newPositionsB.left;
        newReceiverPlayerId = receiver?.id;
      } else {
        const isEven = newScoreB % 2 === 0;
        const server = isEven ? newPositionsB.right : newPositionsB.left;
        newServerPlayerId = server?.id;
        const receiver = isEven ? newPositionsA.right : newPositionsA.left;
        newReceiverPlayerId = receiver?.id;
      }
    }
  } else {
    // BWF Singles Rule:
    if (scoringTeam === 'A') {
      const isEven = newScoreA % 2 === 0;
      newPositionsA = {
        right: isEven ? currentState.teamA.p1 : null,
        left: !isEven ? currentState.teamA.p1 : null
      };
      newPositionsB = {
        right: isEven ? currentState.teamB.p1 : null,
        left: !isEven ? currentState.teamB.p1 : null
      };
      newServerPlayerId = currentState.teamA.p1?.id;
      newReceiverPlayerId = currentState.teamB.p1?.id;
    } else {
      const isEven = newScoreB % 2 === 0;
      newPositionsB = {
        right: isEven ? currentState.teamB.p1 : null,
        left: !isEven ? currentState.teamB.p1 : null
      };
      newPositionsA = {
        right: isEven ? currentState.teamA.p1 : null,
        left: !isEven ? currentState.teamA.p1 : null
      };
      newServerPlayerId = currentState.teamB.p1?.id;
      newReceiverPlayerId = currentState.teamA.p1?.id;
    }
  }

  // Check 11-point interval (mid-game break)
  let isInterval = false;
  if (!currentState.intervalAcknowledged && (newScoreA === 11 || newScoreB === 11)) {
    isInterval = true;
  }

  // Check game status
  const status = checkGameStatus(newScoreA, newScoreB, currentState.targetScore);
  let isGameOver = false;
  let isMatchOver = false;
  let winnerTeam = null;
  let gamesWonA = currentState.gamesWonA;
  let gamesWonB = currentState.gamesWonB;

  if (status.gameWinner) {
    isGameOver = true;
    if (status.gameWinner === 'A') gamesWonA++;
    else gamesWonB++;

    const gamesNeeded = Math.ceil(currentState.format / 2);
    if (gamesWonA === gamesNeeded) {
      isMatchOver = true;
      winnerTeam = 'A';
    } else if (gamesWonB === gamesNeeded) {
      isMatchOver = true;
      winnerTeam = 'B';
    }
  }

  return {
    ...currentState,
    scoreA: newScoreA,
    scoreB: newScoreB,
    gamesWonA,
    gamesWonB,
    servingTeam: newServingTeam,
    serverPlayerId: newServerPlayerId,
    receiverPlayerId: newReceiverPlayerId,
    positionsA: newPositionsA,
    positionsB: newPositionsB,
    isInterval,
    isGameOver,
    isMatchOver,
    winnerTeam,
    history: [...currentState.history, snapshot]
  };
}

/**
 * Undoes the last point scored
 */
export function undoPoint(currentState) {
  if (!currentState.history || currentState.history.length === 0) return currentState;

  const previousSnapshot = currentState.history[currentState.history.length - 1];
  const newHistory = currentState.history.slice(0, -1);

  return {
    ...currentState,
    ...previousSnapshot,
    history: newHistory
  };
}

/**
 * Proceeds to next game in match (swapping ends and resetting points)
 */
export function startNextGame(currentState) {
  if (!currentState.isGameOver || currentState.isMatchOver) return currentState;

  const completedGame = {
    gameNumber: currentState.currentGameNumber,
    scoreA: currentState.scoreA,
    scoreB: currentState.scoreB,
    winner: currentState.scoreA > currentState.scoreB ? 'A' : 'B'
  };

  const nextGameNumber = currentState.currentGameNumber + 1;
  const isDoubles = currentState.mode === MATCH_MODES.DOUBLES;

  // The winner of previous game serves first in the next game
  const nextServingTeam = completedGame.winner;

  return {
    ...currentState,
    scoreA: 0,
    scoreB: 0,
    currentGameNumber: nextGameNumber,
    completedGames: [...currentState.completedGames, completedGame],
    endsSwapped: !currentState.endsSwapped, // Swap court ends
    isInterval: false,
    intervalAcknowledged: false,
    isGameOver: false,
    servingTeam: nextServingTeam,
    serverPlayerId: nextServingTeam === 'A' ? currentState.teamA.p1?.id : currentState.teamB.p1?.id,
    receiverPlayerId: nextServingTeam === 'A' ? currentState.teamB.p1?.id : currentState.teamA.p1?.id,
    positionsA: {
      right: currentState.teamA.p1,
      left: isDoubles ? currentState.teamA.p2 : null
    },
    positionsB: {
      right: currentState.teamB.p1,
      left: isDoubles ? currentState.teamB.p2 : null
    },
    history: []
  };
}
