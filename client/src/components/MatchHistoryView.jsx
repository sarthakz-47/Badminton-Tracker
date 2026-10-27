import React from 'react';
import { History, Trophy, ArrowRight, Calendar } from 'lucide-react';

export default function MatchHistoryView({ matches, isLoading }) {
  return (
    <div>
      <div className="leaderboard-header">
        <div>
          <h1 className="page-title">
            <History size={28} color="#06b6d4" />
            <span>Match History Archive</span>
          </h1>
          <p className="page-subtitle">
            Log of completed matches with game breakdowns and Elo rating outcomes
          </p>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading match history...
        </div>
      ) : matches.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No matches recorded yet. Start your first match from the top menu!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {matches.map(m => {
            const teamAName = m.match_mode === 'doubles'
              ? `${m.team_a_p1_name} & ${m.team_a_p2_name}`
              : m.team_a_p1_name;

            const teamBName = m.match_mode === 'doubles'
              ? `${m.team_b_p1_name} & ${m.team_b_p2_name}`
              : m.team_b_p1_name;

            const winnerIsA = m.winner_team === 'A';

            return (
              <div
                key={m.id}
                className="glass-panel"
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                {/* Left: Mode & Date */}
                <div style={{ minWidth: '120px' }}>
                  <span
                    className="tier-chip"
                    style={{
                      textTransform: 'uppercase',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      marginBottom: '0.35rem',
                      display: 'inline-flex'
                    }}
                  >
                    {m.match_mode}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    <Calendar size={13} />
                    <span>{new Date(m.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Center: Teams & Scores */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1, justifyContent: 'center' }}>
                  {/* Team A */}
                  <div style={{ textAlign: 'right', minWidth: '130px' }}>
                    <div style={{ fontWeight: 700, color: winnerIsA ? '#fff' : 'var(--text-muted)', fontSize: '1rem' }}>
                      {teamAName} {winnerIsA && '👑'}
                    </div>
                    <span className={`rating-delta-pill ${m.rating_delta_a >= 0 ? 'gain' : 'loss'}`} style={{ fontSize: '0.8rem' }}>
                      {m.rating_delta_a >= 0 ? `+${m.rating_delta_a}` : m.rating_delta_a} Elo
                    </span>
                  </div>

                  {/* Games Breakdown Badge */}
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.4rem 1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.15rem', color: '#fff' }}>
                      <span style={{ color: winnerIsA ? 'var(--team-a)' : 'var(--text-muted)' }}>{m.team_a_games_won}</span>
                      {' - '}
                      <span style={{ color: !winnerIsA ? 'var(--team-b)' : 'var(--text-muted)' }}>{m.team_b_games_won}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                      {m.games_data?.map(g => `${g.scoreA}-${g.scoreB}`).join(', ')}
                    </div>
                  </div>

                  {/* Team B */}
                  <div style={{ textAlign: 'left', minWidth: '130px' }}>
                    <div style={{ fontWeight: 700, color: !winnerIsA ? '#fff' : 'var(--text-muted)', fontSize: '1rem' }}>
                      {!winnerIsA && '👑 '} {teamBName}
                    </div>
                    <span className={`rating-delta-pill ${m.rating_delta_b >= 0 ? 'gain' : 'loss'}`} style={{ fontSize: '0.8rem' }}>
                      {m.rating_delta_b >= 0 ? `+${m.rating_delta_b}` : m.rating_delta_b} Elo
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
