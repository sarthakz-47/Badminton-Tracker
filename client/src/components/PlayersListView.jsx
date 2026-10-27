import React, { useState } from 'react';
import { UserPlus, Users, Search, ChevronRight, Award, Trophy } from 'lucide-react';

export default function PlayersListView({
  players,
  onSelectPlayer,
  onOpenCreatePlayer,
  onChallengePlayer
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = players.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="leaderboard-header">
        <div>
          <h1 className="page-title">
            <Users size={28} color="#10b981" />
            <span>Player Roster & Head-to-Head</span>
          </h1>
          <p className="page-subtitle">
            Explore member statistics, head-to-head records, and player ratings
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search
              size={16}
              color="#64748b"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search players..."
              className="form-input"
              style={{ paddingLeft: '2.3rem', paddingRight: '0.75rem', height: '38px', borderRadius: '9999px', fontSize: '0.85rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button className="btn-new-match" onClick={onOpenCreatePlayer}>
            <UserPlus size={16} />
            <span>Add Player</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
        {filtered.map(p => (
          <div
            key={p.id}
            className="glass-panel"
            style={{ padding: '1.25rem', cursor: 'pointer' }}
            onClick={() => onSelectPlayer(p.id)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: p.avatar_color || '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#fff'
                }}
              >
                {p.name.charAt(0)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.name}
                </h3>
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
                  <span className="tier-chip" style={{ fontSize: '0.7rem', color: p.singles_tier.color, borderColor: p.singles_tier.color, padding: '0.2rem 0.5rem' }}>
                    {p.singles_tier.badge} {p.singles_tier.name}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: '10px', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Singles Elo</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>{p.singles_rating}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.singles_wins}W - {p.singles_losses}L</div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Doubles Elo</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, color: '#3b82f6' }}>{p.doubles_rating}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.doubles_wins}W - {p.doubles_losses}L</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                View H2H & Details
              </span>
              <ChevronRight size={18} color="#64748b" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
