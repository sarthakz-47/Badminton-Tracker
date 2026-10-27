import React from 'react';

/**
 * 2D Top-down Badminton Court Visualizer
 * Accurately displays official BWF markings (Singles/Doubles sidelines, short service line,
 * center line, doubles long service line, net) and tracks real-time player positions,
 * server (🏸), and receiver (🎯).
 */
export default function CourtVisualizer({ matchState }) {
  if (!matchState) return null;

  const {
    mode,
    scoreA,
    scoreB,
    servingTeam,
    serverPlayerId,
    receiverPlayerId,
    positionsA,
    positionsB,
    endsSwapped,
    teamA,
    teamB
  } = matchState;

  const isDoubles = mode === 'doubles';

  // Court ends mapping: depending on endsSwapped, Team A is Left or Right
  const leftSideTeam = endsSwapped ? teamB : teamA;
  const rightSideTeam = endsSwapped ? teamA : teamB;
  const leftSidePositions = endsSwapped ? positionsB : positionsA;
  const rightSidePositions = endsSwapped ? positionsA : positionsB;
  const leftSideTag = endsSwapped ? 'B' : 'A';
  const rightSideTag = endsSwapped ? 'A' : 'B';

  // Quadrants:
  // Left Court:
  // - Bottom box = Right Service Court (Even score)
  // - Top box = Left Service Court (Odd score)
  // Right Court (diagonally opposite):
  // - Top box = Right Service Court (Even score)
  // - Bottom box = Left Service Court (Odd score)

  const leftTopPlayer = leftSidePositions.left;
  const leftBottomPlayer = leftSidePositions.right;

  const rightTopPlayer = rightSidePositions.right;
  const rightBottomPlayer = rightSidePositions.left;

  const renderPlayerBadge = (player, teamTag) => {
    if (!player) return null;

    const isServer = player.id === serverPlayerId;
    const isReceiver = player.id === receiverPlayerId;

    let roleClass = '';
    if (isServer) roleClass = 'is-serving';
    else if (isReceiver) roleClass = 'is-receiving';

    return (
      <div className={`court-player-chip team-${teamTag.toLowerCase()} ${roleClass}`}>
        {isServer && <span className="badge-shuttle" title="Server">🏸</span>}
        {isReceiver && <span className="badge-shuttle" title="Receiver">🎯</span>}
        <span>{player.name}</span>
      </div>
    );
  };

  return (
    <div className="court-container">
      <div className="court-wrapper">
        <svg
          className="court-svg"
          viewBox="0 0 800 400"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Court Outer Boundary (Doubles line) */}
          <rect x="30" y="25" width="740" height="350" className="court-line" />

          {/* Singles Sidelines (top & bottom inside lines: 25px inset) */}
          <line x1="30" y1="52" x2="770" y2="52" className="court-line" />
          <line x1="30" y1="348" x2="770" y2="348" className="court-line" />

          {/* Doubles Long Service Lines (left & right inside backlines: 35px inset) */}
          <line x1="68" y1="25" x2="68" y2="375" className="court-line" />
          <line x1="732" y1="25" x2="732" y2="375" className="court-line" />

          {/* Short Service Lines (130px from Net on each side) */}
          {/* Net is at x = 400 */}
          <line x1="270" y1="25" x2="270" y2="375" className="court-line" />
          <line x1="530" y1="25" x2="530" y2="375" className="court-line" />

          {/* Center Lines: from Short Service Line to Back Boundary Line */}
          {/* Left half center line: x from 30 to 270 at y = 200 */}
          <line x1="30" y1="200" x2="270" y2="200" className="court-line" />
          {/* Right half center line: x from 530 to 770 at y = 200 */}
          <line x1="530" y1="200" x2="770" y2="200" className="court-line" />

          {/* Center Net Line (Net at x = 400) */}
          <line x1="400" y1="15" x2="400" y2="385" className="court-net" />

          {/* Net Posts */}
          <circle cx="400" cy="20" r="4" fill="#ffffff" />
          <circle cx="400" cy="380" r="4" fill="#ffffff" />

          {/* Court Labels */}
          <text x="200" y="44" fill="rgba(255,255,255,0.4)" fontSize="11" fontFamily="sans-serif" textAnchor="middle">
            {leftSideTeam.name || `Team ${leftSideTag}`} Court
          </text>
          <text x="600" y="44" fill="rgba(255,255,255,0.4)" fontSize="11" fontFamily="sans-serif" textAnchor="middle">
            {rightSideTeam.name || `Team ${rightSideTag}`} Court
          </text>
        </svg>

        {/* Dynamic Player Overlays (positioned in their respective quadrants) */}

        {/* LEFT COURT - TOP (Left Service Court / Odd) */}
        <div
          className={`court-quadrant ${
            leftTopPlayer?.id === serverPlayerId ? 'server-active' : ''
          } ${leftTopPlayer?.id === receiverPlayerId ? 'receiver-active' : ''}`}
          style={{ top: '15%', left: '8%', width: '28%', height: '35%' }}
        >
          {renderPlayerBadge(leftTopPlayer, leftSideTag)}
          <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
            Left Box (Odd)
          </span>
        </div>

        {/* LEFT COURT - BOTTOM (Right Service Court / Even) */}
        <div
          className={`court-quadrant ${
            leftBottomPlayer?.id === serverPlayerId ? 'server-active' : ''
          } ${leftBottomPlayer?.id === receiverPlayerId ? 'receiver-active' : ''}`}
          style={{ bottom: '15%', left: '8%', width: '28%', height: '35%' }}
        >
          {renderPlayerBadge(leftBottomPlayer, leftSideTag)}
          <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
            Right Box (Even)
          </span>
        </div>

        {/* RIGHT COURT - TOP (Right Service Court / Even) */}
        <div
          className={`court-quadrant ${
            rightTopPlayer?.id === serverPlayerId ? 'server-active' : ''
          } ${rightTopPlayer?.id === receiverPlayerId ? 'receiver-active' : ''}`}
          style={{ top: '15%', right: '8%', width: '28%', height: '35%' }}
        >
          {renderPlayerBadge(rightTopPlayer, rightSideTag)}
          <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
            Right Box (Even)
          </span>
        </div>

        {/* RIGHT COURT - BOTTOM (Left Service Court / Odd) */}
        <div
          className={`court-quadrant ${
            rightBottomPlayer?.id === serverPlayerId ? 'server-active' : ''
          } ${rightBottomPlayer?.id === receiverPlayerId ? 'receiver-active' : ''}`}
          style={{ bottom: '15%', right: '8%', width: '28%', height: '35%' }}
        >
          {renderPlayerBadge(rightBottomPlayer, rightSideTag)}
          <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
            Left Box (Odd)
          </span>
        </div>
      </div>
    </div>
  );
}
