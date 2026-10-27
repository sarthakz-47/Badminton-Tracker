import React from 'react';
import { Undo2, RefreshCw, Play, CheckCircle2, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import { checkGameStatus } from '../utils/badmintonEngine';

export default function ScoreBoard({
  matchState,
  onScorePoint,
  onUndo,
  onNextGame,
  onFinishMatch,
  onSwapEnds
}) {
  if (!matchState) return null;

  const {
    scoreA,
    scoreB,
    gamesWonA,
    gamesWonB,
    currentGameNumber,
    format,
    targetScore,
    teamA,
    teamB,
    isGameOver,
    isMatchOver,
    isInterval,
    history
  } = matchState;

  const gamesNeeded = Math.ceil(format / 2);
  const status = checkGameStatus(scoreA, scoreB, targetScore);

  return (
    <div className="glass-panel" style={{ padding: '1.75rem' }}>
      {/* Dynamic Status / Interval Banner */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', minHeight: '36px' }}>
        {isMatchOver && (
          <div className="status-alert-pill" style={{ background: '#064e3b', color: '#34d399', border: '1px solid #10b981' }}>
            <CheckCircle2 size={16} />
            <span>Match Completed! Winner: Team {matchState.winnerTeam}</span>
          </div>
        )}

        {!isMatchOver && isGameOver && (
          <div className="status-alert-pill game-point">
            <CheckCircle2 size={16} />
            <span>Game {currentGameNumber} Won by Team {scoreA > scoreB ? 'A' : 'B'}!</span>
          </div>
        )}

        {!isGameOver && !isMatchOver && isInterval && (
          <div className="status-alert-pill interval">
            <AlertTriangle size={16} />
            <span>11-Point Interval! Take a 60-second break</span>
          </div>
        )}

        {!isGameOver && !isMatchOver && !isInterval && status.alert && (
          <div className="status-alert-pill game-point">
            <span>⚡ {status.alert}</span>
          </div>
        )}
      </div>

      {/* Main Scoreboard Layout */}
      <div className="scoreboard-grid">
        {/* TEAM A CARD */}
        <div className="glass-panel team-card team-a">
          <div className="team-header">
            <h3 className="team-name">{teamA.name || 'Team A'}</h3>
            <p className="player-names-sub">
              {teamA.p1?.name} {teamA.p2 ? `& ${teamA.p2.name}` : ''}
            </p>
            <div className="games-won-dots" title={`Games won: ${gamesWonA} / ${gamesNeeded}`}>
              {Array.from({ length: gamesNeeded }).map((_, i) => (
                <div key={i} className={`game-dot ${i < gamesWonA ? 'won-a' : ''}`} />
              ))}
            </div>
          </div>

          <button
            className="score-btn"
            onClick={() => onScorePoint('A')}
            disabled={isGameOver || isMatchOver}
            aria-label="Add point for Team A"
          >
            <span className="score-number">{scoreA}</span>
            <span className="score-tap-hint">+1 Point</span>
          </button>
        </div>

        {/* CENTER MATCH STATS */}
        <div className="match-center-panel">
          <div className="game-badge">
            Game {currentGameNumber} of {format}
          </div>
          <div className="versus-label">VS</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            First to {targetScore} pts
            {status.isDeuce && <div style={{ color: 'var(--gold)', fontWeight: 700 }}>Must win by 2</div>}
          </div>

          {/* Action to proceed to next game if game is won */}
          {!isMatchOver && isGameOver && (
            <button
              className="btn-new-match"
              style={{ padding: '0.75rem 1.25rem', marginTop: '0.5rem' }}
              onClick={onNextGame}
            >
              <Play size={16} />
              <span>Start Game {currentGameNumber + 1}</span>
            </button>
          )}

          {/* Action to finalize match if match is won */}
          {isMatchOver && (
            <button
              className="btn-new-match"
              style={{ background: '#f59e0b', color: '#000', padding: '0.75rem 1.25rem', marginTop: '0.5rem' }}
              onClick={onFinishMatch}
            >
              <CheckCircle2 size={16} />
              <span>Finalize & Update Ratings</span>
            </button>
          )}
        </div>

        {/* TEAM B CARD */}
        <div className="glass-panel team-card team-b">
          <div className="team-header">
            <h3 className="team-name">{teamB.name || 'Team B'}</h3>
            <p className="player-names-sub">
              {teamB.p1?.name} {teamB.p2 ? `& ${teamB.p2.name}` : ''}
            </p>
            <div className="games-won-dots" title={`Games won: ${gamesWonB} / ${gamesNeeded}`}>
              {Array.from({ length: gamesNeeded }).map((_, i) => (
                <div key={i} className={`game-dot ${i < gamesWonB ? 'won-b' : ''}`} />
              ))}
            </div>
          </div>

          <button
            className="score-btn"
            onClick={() => onScorePoint('B')}
            disabled={isGameOver || isMatchOver}
            aria-label="Add point for Team B"
          >
            <span className="score-number">{scoreB}</span>
            <span className="score-tap-hint">+1 Point</span>
          </button>
        </div>
      </div>

      {/* Action Controls Bar */}
      <div className="controls-bar">
        <button
          className="btn-ctrl"
          onClick={onUndo}
          disabled={!history || history.length === 0}
          title="Undo last point"
        >
          <Undo2 size={17} />
          <span>Undo Point</span>
        </button>

        <button
          className="btn-ctrl"
          onClick={onSwapEnds}
          title="Swap visual court ends"
        >
          <ArrowRightLeft size={17} />
          <span>Swap Ends</span>
        </button>
      </div>
    </div>
  );
}
