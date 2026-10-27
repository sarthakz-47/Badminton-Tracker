import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, TrendingUp, TrendingDown, RotateCcw, ArrowRight, Check } from 'lucide-react';

export default function MatchEndModal({
  isOpen,
  matchResult,
  matchState,
  onGoToLeaderboard,
  onRematch,
  onNewMatch
}) {
  useEffect(() => {
    if (isOpen) {
      // Fire celebration confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 300);
    }
  }, [isOpen]);

  if (!isOpen || !matchState) return null;

  const winner = matchState.winnerTeam;
  const winningTeamObj = winner === 'A' ? matchState.teamA : matchState.teamB;

  // Games summary
  const allGames = [
    ...matchState.completedGames,
    {
      gameNumber: matchState.currentGameNumber,
      scoreA: matchState.scoreA,
      scoreB: matchState.scoreB
    }
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '640px', textAlign: 'center' }}>
        <div className="celebration-wrap">
          <div className="winner-crown">👑</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800 }}>
            Match Concluded
          </div>
          <h2 className="winner-title">{winningTeamObj.name} Wins!</h2>
        </div>

        {/* Game Scores Breakdown */}
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '14px', margin: '1rem 0', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
            GAME BREAKDOWN
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            {allGames.map((g, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.2rem' }}>Game {g.gameNumber}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                  <strong style={{ color: g.scoreA > g.scoreB ? 'var(--team-a)' : 'var(--text-muted)' }}>{g.scoreA}</strong>
                  {' - '}
                  <strong style={{ color: g.scoreB > g.scoreA ? 'var(--team-b)' : 'var(--text-muted)' }}>{g.scoreB}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Adjustment Cards (If result from backend is present) */}
        {matchResult && (
          <div style={{ margin: '1.5rem 0' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
              OFFICIAL ELO RATING UPDATES
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Team A Rating Deltas */}
              <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--team-a)', fontWeight: 700, marginBottom: '0.5rem' }}>
                  {matchState.teamA.name}
                </div>
                {matchResult.updatedTeamA?.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.35rem 0' }}>
                    <span style={{ fontSize: '0.9rem', color: '#fff' }}>{p.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{p.oldRating}</span>
                      <ArrowRight size={12} color="#64748b" />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{p.newRating}</span>
                      <span className={`rating-delta-pill ${p.delta >= 0 ? 'gain' : 'loss'}`} style={{ fontSize: '0.85rem', marginLeft: '0.35rem' }}>
                        {p.delta >= 0 ? `+${p.delta}` : p.delta}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Team B Rating Deltas */}
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--team-b)', fontWeight: 700, marginBottom: '0.5rem' }}>
                  {matchState.teamB.name}
                </div>
                {matchResult.updatedTeamB?.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.35rem 0' }}>
                    <span style={{ fontSize: '0.9rem', color: '#fff' }}>{p.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{p.oldRating}</span>
                      <ArrowRight size={12} color="#64748b" />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{p.newRating}</span>
                      <span className={`rating-delta-pill ${p.delta >= 0 ? 'gain' : 'loss'}`} style={{ fontSize: '0.85rem', marginLeft: '0.35rem' }}>
                        {p.delta >= 0 ? `+${p.delta}` : p.delta}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <button
            className="btn-new-match"
            style={{ padding: '0.75rem 1.5rem' }}
            onClick={onGoToLeaderboard}
          >
            <Trophy size={18} />
            <span>Go to Leaderboard</span>
          </button>

          <button
            className="btn-ctrl"
            style={{ padding: '0.75rem 1.5rem' }}
            onClick={onRematch}
          >
            <RotateCcw size={18} />
            <span>Rematch</span>
          </button>

          <button
            className="btn-ctrl"
            style={{ padding: '0.75rem 1.5rem' }}
            onClick={onNewMatch}
          >
            <span>New Matchup</span>
          </button>
        </div>
      </div>
    </div>
  );
}
