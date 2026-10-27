import React, { useState, useEffect } from 'react';
import { X, Trophy, Swords, Flame, Award, History, ArrowRight, Trash2, Edit3 } from 'lucide-react';
import { fetchPlayerDetails, fetchH2H } from '../services/api';

export default function PlayerProfileModal({
  playerId,
  allPlayers,
  onClose,
  onDeletePlayer,
  onEditPlayer
}) {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [opponentId, setOpponentId] = useState('');
  const [h2hData, setH2HData] = useState(null);
  const [loadingH2H, setLoadingH2H] = useState(false);

  useEffect(() => {
    if (!playerId) return;
    setLoading(true);
    fetchPlayerDetails(playerId)
      .then(data => {
        setPlayer(data);
        // Find default opponent (first other player)
        const other = allPlayers.find(p => p.id !== playerId);
        if (other) {
          setOpponentId(other.id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [playerId, allPlayers]);

  useEffect(() => {
    if (!playerId || !opponentId) return;
    setLoadingH2H(true);
    fetchH2H(playerId, opponentId)
      .then(setH2HData)
      .catch(console.error)
      .finally(() => setLoadingH2H(false));
  }, [playerId, opponentId]);

  if (!playerId) return null;

  const opponentObj = allPlayers.find(p => p.id === Number(opponentId));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <span>👤</span> Player Profile
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {loading || !player ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading player data...
          </div>
        ) : (
          <div>
            {/* Player Bio Hero Card */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '16px', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: player.avatar_color || '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: '#fff',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.4)'
                }}
              >
                {player.name.charAt(0)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                    {player.name}
                  </h2>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {onEditPlayer && (
                      <button
                        className="btn-ctrl"
                        style={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          borderColor: 'rgba(59, 130, 246, 0.3)',
                          color: '#60a5fa',
                          padding: '0.4rem 0.8rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          onEditPlayer(player);
                        }}
                        title="Edit Player & Ratings"
                      >
                        <Edit3 size={14} />
                        <span>Edit</span>
                      </button>
                    )}
                    {onDeletePlayer && (
                      <button
                        className="btn-ctrl"
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          borderColor: 'rgba(239, 68, 68, 0.3)',
                          color: '#ef4444',
                          padding: '0.4rem 0.8rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${player.name}"? This will remove the player and their match records.`)) {
                            onDeletePlayer(player.id);
                          }
                        }}
                        title="Delete Player"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                  <span className="tier-chip" style={{ color: player.singles_tier.color, borderColor: player.singles_tier.color }}>
                    <span>{player.singles_tier.badge}</span>
                    <span>Singles: {player.singles_tier.name}</span>
                  </span>
                  <span className="tier-chip" style={{ color: player.doubles_tier.color, borderColor: player.doubles_tier.color }}>
                    <span>{player.doubles_tier.badge}</span>
                    <span>Doubles: {player.doubles_tier.name}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Ratings Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Singles Rating
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, color: '#10b981', margin: '0.2rem 0' }}>
                  {player.singles_rating}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Record: <strong>{player.singles_wins}W</strong> - <strong>{player.singles_losses}L</strong> ({player.singles_win_rate}%)
                </div>
              </div>

              <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Doubles Rating
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, color: '#3b82f6', margin: '0.2rem 0' }}>
                  {player.doubles_rating}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Record: <strong>{player.doubles_wins}W</strong> - <strong>{player.doubles_losses}L</strong> ({player.doubles_win_rate}%)
                </div>
              </div>
            </div>

            {/* Head-to-Head Matchup Tool */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                  <Swords size={18} color="#f59e0b" />
                  <span>Head-to-Head Comparison</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>vs</span>
                  <select
                    className="form-select"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', width: 'auto' }}
                    value={opponentId}
                    onChange={e => setOpponentId(e.target.value)}
                  >
                    {allPlayers.filter(p => p.id !== playerId).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {loadingH2H ? (
                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
                  Comparing stats...
                </div>
              ) : h2hData ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '1rem 0' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{h2hData.p1Wins}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{player.name}</div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Matches</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>{h2hData.totalMatches}</div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>{h2hData.p2Wins}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{opponentObj?.name}</div>
                    </div>
                  </div>

                  {/* Ratio bar */}
                  {h2hData.totalMatches > 0 && (
                    <div style={{ height: '8px', background: '#ef4444', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                      <div
                        style={{
                          width: `${(h2hData.p1Wins / h2hData.totalMatches) * 100}%`,
                          background: '#10b981',
                          height: '100%'
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Recent Matches */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginBottom: '0.75rem' }}>
                <History size={16} color="#10b981" />
                <span>Recent Matches</span>
              </div>

              {player.recentMatches?.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No recent matches logged for this player yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {player.recentMatches?.map(m => {
                    const isInTeamA = m.team_a_p1_id === player.id || m.team_a_p2_id === player.id;
                    const won = (isInTeamA && m.winner_team === 'A') || (!isInTeamA && m.winner_team === 'B');
                    const delta = isInTeamA ? m.rating_delta_a : m.rating_delta_b;

                    return (
                      <div
                        key={m.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 1rem',
                          background: 'rgba(255, 255, 255, 0.02)',
                          borderRadius: '8px',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span
                            className={`form-pill ${won ? 'win' : 'loss'}`}
                            style={{ width: '26px', height: '26px', fontSize: '0.75rem' }}
                          >
                            {won ? 'W' : 'L'}
                          </span>
                          <span style={{ fontSize: '0.9rem', color: '#fff' }}>
                            vs {isInTeamA ? m.team_b_p1_name : m.team_a_p1_name} ({m.match_mode})
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {m.games_data?.map(g => `${g.scoreA}-${g.scoreB}`).join(', ')}
                          </span>
                          <span className={`rating-delta-pill ${delta >= 0 ? 'gain' : 'loss'}`} style={{ fontSize: '0.85rem' }}>
                            {delta >= 0 ? `+${delta}` : delta}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
