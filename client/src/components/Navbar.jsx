import React from 'react';
import { Trophy, Activity, Users, History, PlusCircle, Award } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenNewMatch, overviewStats }) {
  return (
    <>
      {/* Top Header */}
      <header className="navbar">
        <div className="navbar-inner">
          {/* Brand */}
          <div className="logo-badge" onClick={() => setActiveTab('match')}>
            <div className="logo-icon-wrap">🏸</div>
            <div className="logo-text">
              Smash<span>Rank</span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="nav-tabs desktop-only">
            <button
              className={`nav-btn ${activeTab === 'match' ? 'active' : ''}`}
              onClick={() => setActiveTab('match')}
            >
              <Activity size={18} />
              <span>Live Match</span>
            </button>

            <button
              className={`nav-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('leaderboard')}
            >
              <Trophy size={18} />
              <span>Leaderboard</span>
            </button>

            <button
              className={`nav-btn ${activeTab === 'players' ? 'active' : ''}`}
              onClick={() => setActiveTab('players')}
            >
              <Users size={18} />
              <span>Players & H2H</span>
            </button>

            <button
              className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <History size={18} />
              <span>History</span>
            </button>
          </nav>

          {/* Right Action & Stats */}
          <div className="navbar-right">
            {overviewStats && (
              <div className="stat-pill desktop-only" title="Total matches logged">
                <Award size={15} color="#10b981" />
                <span>Matches: <strong>{overviewStats.matchCount || 0}</strong></span>
              </div>
            )}
            <button className="btn-new-match" onClick={onOpenNewMatch}>
              <PlusCircle size={18} />
              <span className="btn-new-match-text">New Match</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        <button
          className={`mobile-nav-item ${activeTab === 'match' ? 'active' : ''}`}
          onClick={() => setActiveTab('match')}
        >
          <Activity size={20} />
          <span>Match</span>
        </button>

        <button
          className={`mobile-nav-item ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          <Trophy size={20} />
          <span>Ranks</span>
        </button>

        <button
          className={`mobile-nav-item ${activeTab === 'players' ? 'active' : ''}`}
          onClick={() => setActiveTab('players')}
        >
          <Users size={20} />
          <span>Players</span>
        </button>

        <button
          className={`mobile-nav-item ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <History size={20} />
          <span>History</span>
        </button>
      </nav>
    </>
  );
}
