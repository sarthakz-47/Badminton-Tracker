import React, { useState, useEffect } from 'react';
import { X, UserPlus, Check, UserCheck, Shield } from 'lucide-react';

const AVATAR_COLORS = [
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#EC4899'  // Pink
];

function getPreviewTier(rating) {
  const r = Number(rating) || 1200;
  if (r >= 1700) return { name: 'Smash Elite', badge: '👑', color: '#F59E0B' };
  if (r >= 1500) return { name: 'Master', badge: '💎', color: '#8B5CF6' };
  if (r >= 1300) return { name: 'Advanced', badge: '🥇', color: '#10B981' };
  if (r >= 1100) return { name: 'Club Player', badge: '🥈', color: '#06B6D4' };
  return { name: 'Novice', badge: '🥉', color: '#94A3B8' };
}

export default function AddPlayerModal({
  isOpen,
  onClose,
  onSavePlayer,
  initialData = null
}) {
  const [name, setName] = useState('');
  const [singlesRating, setSinglesRating] = useState(1200);
  const [doublesRating, setDoublesRating] = useState(1200);
  const [singlesWins, setSinglesWins] = useState(0);
  const [singlesLosses, setSinglesLosses] = useState(0);
  const [doublesWins, setDoublesWins] = useState(0);
  const [doublesLosses, setDoublesLosses] = useState(0);
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setSinglesRating(initialData.singles_rating || 1200);
      setDoublesRating(initialData.doubles_rating || 1200);
      setSinglesWins(initialData.singles_wins || 0);
      setSinglesLosses(initialData.singles_losses || 0);
      setDoublesWins(initialData.doubles_wins || 0);
      setDoublesLosses(initialData.doubles_losses || 0);
      setAvatarColor(initialData.avatar_color || AVATAR_COLORS[0]);
    } else {
      setName('');
      setSinglesRating(1200);
      setDoublesRating(1200);
      setSinglesWins(0);
      setSinglesLosses(0);
      setDoublesWins(0);
      setDoublesLosses(0);
      setAvatarColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const singlesTier = getPreviewTier(singlesRating);
  const doublesTier = getPreviewTier(doublesRating);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter player name');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const payload = {
        name: name.trim(),
        singles_rating: Number(singlesRating) || 1200,
        doubles_rating: Number(doublesRating) || 1200,
        singles_wins: Number(singlesWins) || 0,
        singles_losses: Number(singlesLosses) || 0,
        doubles_wins: Number(doublesWins) || 0,
        doubles_losses: Number(doublesLosses) || 0,
        avatar_color: avatarColor
      };

      await onSavePlayer(payload, initialData?.id);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save player');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <span>{isEditMode ? '✏️' : '👤'}</span>
            <span>{isEditMode ? 'Edit Player & Rating' : 'Add New Player with Custom Rating'}</span>
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

        <form onSubmit={handleSubmit}>
          {/* Player Name */}
          <div className="form-group">
            <label className="form-label">Player Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Sarthak, Viktor Axelsen, Lin Dan..."
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          {/* Color Picker */}
          <div className="form-group">
            <label className="form-label">Avatar Color</label>
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              {AVATAR_COLORS.map(c => (
                <div
                  key={c}
                  onClick={() => setAvatarColor(c)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: c,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: avatarColor === c ? '3px solid #fff' : '2px solid transparent',
                    boxShadow: avatarColor === c ? '0 0 10px rgba(255,255,255,0.4)' : 'none'
                  }}
                >
                  {avatarColor === c && <Check size={16} color="#fff" />}
                </div>
              ))}
            </div>
          </div>

          {/* Custom Ratings Grid with Live Tier Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(255, 255, 255, 0.03)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
            {/* Singles Rating */}
            <div>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Singles Elo</span>
                <span className="tier-chip" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem', borderColor: singlesTier.color, color: singlesTier.color }}>
                  {singlesTier.badge} {singlesTier.name}
                </span>
              </label>
              <input
                type="number"
                min="100"
                max="3000"
                step="10"
                className="form-input"
                style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.25rem', color: '#10b981' }}
                value={singlesRating}
                onChange={e => setSinglesRating(e.target.value)}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.25rem', display: 'block' }}>
                Standard starting: 1200
              </span>
            </div>

            {/* Doubles Rating */}
            <div>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Doubles Elo</span>
                <span className="tier-chip" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem', borderColor: doublesTier.color, color: doublesTier.color }}>
                  {doublesTier.badge} {doublesTier.name}
                </span>
              </label>
              <input
                type="number"
                min="100"
                max="3000"
                step="10"
                className="form-input"
                style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.25rem', color: '#3b82f6' }}
                value={doublesRating}
                onChange={e => setDoublesRating(e.target.value)}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.25rem', display: 'block' }}>
                Standard starting: 1200
              </span>
            </div>
          </div>

          {/* Optional Initial Career Wins / Losses */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
              INITIAL CAREER RECORD (OPTIONAL)
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  placeholder="Singles W"
                  title="Singles Wins"
                  value={singlesWins || ''}
                  onChange={e => setSinglesWins(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  placeholder="Singles L"
                  title="Singles Losses"
                  value={singlesLosses || ''}
                  onChange={e => setSinglesLosses(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  placeholder="Doubles W"
                  title="Doubles Wins"
                  value={doublesWins || ''}
                  onChange={e => setDoublesWins(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  placeholder="Doubles L"
                  title="Doubles Losses"
                  value={doublesLosses || ''}
                  onChange={e => setDoublesLosses(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-new-match"
            style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '1rem' }}
            disabled={isSubmitting}
          >
            <UserCheck size={18} />
            <span>{isSubmitting ? 'Saving...' : isEditMode ? 'Update Player' : 'Create & Rank Player'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
