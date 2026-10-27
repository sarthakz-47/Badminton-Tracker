import React, { useState } from 'react';
import { X, Play, UserPlus, Users, User, Dices } from 'lucide-react';
import { MATCH_MODES, FORMATS } from '../utils/badmintonEngine';

export default function MatchSetupModal({
  isOpen,
  onClose,
  players,
  onStartMatch,
  onCreatePlayer
}) {
  const [mode, setMode] = useState(MATCH_MODES.SINGLES);
  const [format, setFormat] = useState(FORMATS.BEST_OF_3);
  const [targetScore, setTargetScore] = useState(21);

  const [teamAP1, setTeamAP1] = useState(players[0]?.id || '');
  const [teamAP2, setTeamAP2] = useState('');
  const [teamBP1, setTeamBP1] = useState(players[1]?.id || '');
  const [teamBP2, setTeamBP2] = useState('');

  const [initialServerTeam, setInitialServerTeam] = useState('A');

  // Quick player creation inline
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isSubmittingPlayer, setIsSubmittingPlayer] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleCreatePlayer = async (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    try {
      setIsSubmittingPlayer(true);
      setErrorMsg('');
      const created = await onCreatePlayer(newPlayerName.trim());
      setNewPlayerName('');
      setShowAddPlayer(false);
      // Auto-assign to an empty slot if available
      if (!teamAP1) setTeamAP1(created.id);
      else if (!teamBP1) setTeamBP1(created.id);
      else if (mode === MATCH_MODES.DOUBLES && !teamAP2) setTeamAP2(created.id);
      else if (mode === MATCH_MODES.DOUBLES && !teamBP2) setTeamBP2(created.id);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create player');
    } finally {
      setIsSubmittingPlayer(false);
    }
  };

  const handleStart = () => {
    setErrorMsg('');
    if (!teamAP1 || !teamBP1) {
      setErrorMsg('Please select players for both teams.');
      return;
    }

    if (mode === MATCH_MODES.DOUBLES && (!teamAP2 || !teamBP2)) {
      setErrorMsg('Doubles requires 2 players for each team.');
      return;
    }

    // Check unique players
    const selectedIds = [teamAP1, teamBP1];
    if (mode === MATCH_MODES.DOUBLES) {
      selectedIds.push(teamAP2, teamBP2);
    }

    const uniqueIds = new Set(selectedIds);
    if (uniqueIds.size !== selectedIds.length) {
      setErrorMsg('Each player can only be assigned to one position.');
      return;
    }

    const pA1 = players.find(p => p.id === Number(teamAP1));
    const pA2 = teamAP2 ? players.find(p => p.id === Number(teamAP2)) : null;
    const pB1 = players.find(p => p.id === Number(teamBP1));
    const pB2 = teamBP2 ? players.find(p => p.id === Number(teamBP2)) : null;

    onStartMatch({
      mode,
      format,
      targetScore,
      teamA: {
        p1: pA1,
        p2: pA2,
        name: mode === MATCH_MODES.DOUBLES ? `${pA1.name} & ${pA2.name}` : pA1.name
      },
      teamB: {
        p1: pB1,
        p2: pB2,
        name: mode === MATCH_MODES.DOUBLES ? `${pB1.name} & ${pB2.name}` : pB1.name
      },
      initialServerTeam
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <span>🏸</span> Match Setup
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
            {errorMsg}
          </div>
        )}

        {/* Match Mode Selection */}
        <div className="form-group">
          <label className="form-label">Match Mode</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              type="button"
              className={`btn-ctrl ${mode === MATCH_MODES.SINGLES ? 'active' : ''}`}
              style={{
                justifyContent: 'center',
                padding: '0.75rem',
                borderColor: mode === MATCH_MODES.SINGLES ? 'var(--court-accent)' : undefined,
                background: mode === MATCH_MODES.SINGLES ? 'rgba(16, 185, 129, 0.2)' : undefined
              }}
              onClick={() => setMode(MATCH_MODES.SINGLES)}
            >
              <User size={18} />
              <span>Singles (1 vs 1)</span>
            </button>

            <button
              type="button"
              className={`btn-ctrl ${mode === MATCH_MODES.DOUBLES ? 'active' : ''}`}
              style={{
                justifyContent: 'center',
                padding: '0.75rem',
                borderColor: mode === MATCH_MODES.DOUBLES ? 'var(--court-accent)' : undefined,
                background: mode === MATCH_MODES.DOUBLES ? 'rgba(16, 185, 129, 0.2)' : undefined
              }}
              onClick={() => setMode(MATCH_MODES.DOUBLES)}
            >
              <Users size={18} />
              <span>Doubles (2 vs 2)</span>
            </button>
          </div>
        </div>

        {/* Format & Target Score */}
        <div className="modal-two-col" style={{ marginBottom: '1.25rem' }}>
          <div>
            <label className="form-label">Format</label>
            <select
              className="form-select"
              value={format}
              onChange={(e) => setFormat(Number(e.target.value))}
            >
              <option value={FORMATS.BEST_OF_3}>Best of 3 Games</option>
              <option value={FORMATS.BEST_OF_1}>Single Game (1 Game)</option>
            </select>
          </div>

          <div>
            <label className="form-label">Target Score</label>
            <select
              className="form-select"
              value={targetScore}
              onChange={(e) => setTargetScore(Number(e.target.value))}
            >
              <option value={21}>21 Points (BWF Standard)</option>
              <option value={15}>15 Points (Fast Play)</option>
              <option value={11}>11 Points (Quick Sprint)</option>
            </select>
          </div>
        </div>

        {/* Players Selection */}
        <div className="modal-teams-grid" style={{ marginBottom: '1.25rem' }}>
          {/* Team A */}
          <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <h4 style={{ color: 'var(--team-a)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}>
              <span>Side A</span>
            </h4>

            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Player 1 (Initial Server)
              </label>
              <select
                className="form-select"
                value={teamAP1}
                onChange={(e) => setTeamAP1(e.target.value)}
              >
                <option value="">Select Player</option>
                {players.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({mode === 'doubles' ? p.doubles_rating : p.singles_rating} Elo)</option>
                ))}
              </select>
            </div>

            {mode === MATCH_MODES.DOUBLES && (
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                  Player 2 (Partner)
                </label>
                <select
                  className="form-select"
                  value={teamAP2}
                  onChange={(e) => setTeamAP2(e.target.value)}
                >
                  <option value="">Select Partner</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.doubles_rating} Elo)</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Team B */}
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <h4 style={{ color: 'var(--team-b)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}>
              <span>Side B</span>
            </h4>

            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Player 1 (Initial Receiver)
              </label>
              <select
                className="form-select"
                value={teamBP1}
                onChange={(e) => setTeamBP1(e.target.value)}
              >
                <option value="">Select Player</option>
                {players.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({mode === 'doubles' ? p.doubles_rating : p.singles_rating} Elo)</option>
                ))}
              </select>
            </div>

            {mode === MATCH_MODES.DOUBLES && (
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                  Player 2 (Partner)
                </label>
                <select
                  className="form-select"
                  value={teamBP2}
                  onChange={(e) => setTeamBP2(e.target.value)}
                >
                  <option value="">Select Partner</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.doubles_rating} Elo)</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Quick Add Player Toggle */}
        <div style={{ marginBottom: '1.5rem' }}>
          {!showAddPlayer ? (
            <button
              type="button"
              className="btn-ctrl"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setShowAddPlayer(true)}
            >
              <UserPlus size={16} />
              <span>+ Quick Register New Player</span>
            </button>
          ) : (
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '1rem', borderRadius: '10px', border: '1px dashed var(--border-subtle)' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Player full name"
                  className="form-input"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  autoFocus
                />
                <button
                  type="button"
                  className="btn-new-match"
                  onClick={handleCreatePlayer}
                  disabled={isSubmittingPlayer}
                >
                  {isSubmittingPlayer ? 'Adding...' : 'Add'}
                </button>
                <button
                  type="button"
                  className="btn-ctrl"
                  onClick={() => setShowAddPlayer(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Start Match Button */}
        <button
          type="button"
          className="btn-new-match"
          style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '1rem' }}
          onClick={handleStart}
        >
          <Play size={18} />
          <span>Launch Match Tracker</span>
        </button>
      </div>
    </div>
  );
}
