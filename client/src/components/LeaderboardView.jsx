import React, { useState } from 'react';
import { Search, Flame, Snowflake, ChevronRight, Award, Trophy, UserPlus } from 'lucide-react';

export default function LeaderboardView({
  leaderboard,
  mode,
  setMode,
  onSelectPlayer,
  onOpenAddPlayer,
  isLoading
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlayers = leaderboard.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Header & Controls */}
      <div className="leaderboard-header">
        <div>
          <h1 className="page-title">
            <Trophy size={28} color="#f59e0b" />
            <span>Badminton Leaderboard</span>
          </h1>
          <p className="page-subtitle">
            Live Elo rankings calculated using official BWF match outcomes & point margins
          </p>
        </div>

        {/* Mode Filter & Search */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="nav-tabs">
            <button
              className={`nav-btn ${mode === 'singles' ? 'active' : ''}`}
              onClick={() => setMode('singles')}
            >
              Singles
            </button>
            <button
              className={`nav-btn ${mode === 'doubles' ? 'active' : ''}`}
              onClick={() => setMode('doubles')}
            >
              Doubles
            </button>
            <button
              className={`nav-btn ${mode === 'all' ? 'active' : ''}`}
              onClick={() => setMode('all')}
            >
              Combined
            </button>
          </div>

          <div style={{ position: 'relative', minWidth: '180px' }}>
            <Search
              size={16}
              color="#64748b"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search player..."
              className="form-input"
              style={{ paddingLeft: '2.3rem', paddingRight: '0.75rem', height: '38px', borderRadius: '9999px', fontSize: '0.85rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {onOpenAddPlayer && (
            <button className="btn-new-match" style={{ height: '38px', padding: '0 1rem' }} onClick={onOpenAddPlayer}>
              <UserPlus size={16} />
              <span>Add Player</span>
            </button>
          )}
        </div>
      </div>

      {/* Tier Badges Legend */}
      <div className="tier-legend" style={{ marginBottom: '1.25rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', alignSelf: 'center', fontWeight: 600 }}>
          TIERS:
        </span>
        <div className="tier-chip">
          <span>👑</span>
          <span style={{ color: '#F59E0B' }}>Smash Elite (1700+)</span>
        </div>
        <div className="tier-chip">
          <span>💎</span>
          <span style={{ color: '#8B5CF6' }}>Master (1500+)</span>
        </div>
        <div className="tier-chip">
          <span>🥇</span>
          <span style={{ color: '#10B981' }}>Advanced (1300+)</span>
        </div>
        <div className="tier-chip">
          <span>🥈</span>
          <span style={{ color: '#06B6D4' }}>Club Player (1100+)</span>
        </div>
        <div className="tier-chip">
          <span>🥉</span>
          <span style={{ color: '#94A3B8' }}>Novice (&lt;1100)</span>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="glass-panel" style={{ padding: '1rem' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading rankings...
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No players found matching "{searchQuery}"
          </div>
        ) : (
          <div className="table-container">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Rank</th>
                  <th>Player</th>
                  <th>Tier</th>
                  <th>Elo Rating</th>
                  <th>Record (W - L)</th>
                  <th>Win Rate</th>
                  <th>Streak</th>
                  <th>Recent Form</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player, idx) => {
                  const rankClass = idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : '';
                  const streakIsPositive = player.current_streak > 0;

                  return (
                    <tr
                      key={player.id}
                      className="leaderboard-row"
                      onClick={() => onSelectPlayer(player.id)}
                    >
                      <td className={`rank-cell ${rankClass}`}>
                        {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `#${player.rank}`}
                      </td>

                      <td>
                        <div className="player-info-cell">
                          <div
                            className="player-avatar"
                            style={{ background: player.avatar_color || '#10b981' }}
                          >
                            {player.name.charAt(0)}
                          </div>
                          <div>
                            <span className="player-name-text">{player.name}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className="tier-chip"
                          style={{ borderColor: player.tier.color, color: player.tier.color, background: 'rgba(0,0,0,0.3)' }}
                        >
                          <span>{player.tier.badge}</span>
                          <span>{player.tier.name}</span>
                        </span>
                      </td>

                      <td>
                        <span className="rating-badge">{player.rating}</span>
                      </td>

                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                          <strong style={{ color: '#10b981' }}>{player.wins}W</strong> - <strong style={{ color: '#ef4444' }}>{player.losses}L</strong>
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{ width: '65px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${player.win_rate}%`,
                                height: '100%',
                                background: player.win_rate >= 50 ? '#10b981' : '#f59e0b'
                              }}
                            />
                          </div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#fff' }}>
                            {player.win_rate}%
                          </span>
                        </div>
                      </td>

                      <td>
                        {player.current_streak !== 0 ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                            {streakIsPositive ? (
                              <>
                                <Flame size={15} color="#f59e0b" />
                                <span style={{ color: '#f59e0b', fontWeight: 700 }}>+{player.current_streak}</span>
                              </>
                            ) : (
                              <>
                                <Snowflake size={15} color="#60a5fa" />
                                <span style={{ color: '#60a5fa', fontWeight: 700 }}>{player.current_streak}</span>
                              </>
                            )}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-dim)' }}>-</span>
                        )}
                      </td>

                      <td>
                        <div className="form-pill-group">
                          {player.form && player.form.map((res, i) => (
                            <div
                              key={i}
                              className={`form-pill ${res === 'W' ? 'win' : res === 'L' ? 'loss' : ''}`}
                            >
                              {res}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <ChevronRight size={18} color="#64748b" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
