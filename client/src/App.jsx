import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CourtVisualizer from './components/CourtVisualizer';
import ScoreBoard from './components/ScoreBoard';
import LeaderboardView from './components/LeaderboardView';
import PlayersListView from './components/PlayersListView';
import MatchHistoryView from './components/MatchHistoryView';
import MatchSetupModal from './components/MatchSetupModal';
import MatchEndModal from './components/MatchEndModal';
import PlayerProfileModal from './components/PlayerProfileModal';
import AddPlayerModal from './components/AddPlayerModal';

import {
  fetchPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
  fetchLeaderboard,
  fetchOverviewStats,
  fetchMatches,
  submitMatch
} from './services/api';

import {
  createInitialMatchState,
  scorePoint,
  undoPoint,
  startNextGame,
  MATCH_MODES,
  FORMATS
} from './utils/badmintonEngine';

import { Play, PlusCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('match');
  const [players, setPlayers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardMode, setLeaderboardMode] = useState('singles');
  const [overviewStats, setOverviewStats] = useState(null);
  const [matches, setMatches] = useState([]);

  // Match state
  const [matchState, setMatchState] = useState(null);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);
  const [lastMatchResult, setLastMatchResult] = useState(null);
  const [isSubmittingMatch, setIsSubmittingMatch] = useState(false);

  // Profile modal & Add/Edit Player Modal
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [editingPlayerData, setEditingPlayerData] = useState(null);

  // Load initial data
  const loadInitialData = async () => {
    try {
      const [pData, lData, oData, mData] = await Promise.all([
        fetchPlayers(),
        fetchLeaderboard(leaderboardMode),
        fetchOverviewStats(),
        fetchMatches(25)
      ]);

      setPlayers(pData);
      setLeaderboard(lData);
      setOverviewStats(oData);
      setMatches(mData);

      // If no active match, initialize default quick match between top 2 players
      if (!matchState && pData.length >= 2) {
        const defaultMatch = createInitialMatchState({
          mode: MATCH_MODES.SINGLES,
          format: FORMATS.BEST_OF_3,
          targetScore: 21,
          teamA: { p1: pData[0], p2: null, name: pData[0].name },
          teamB: { p1: pData[1], p2: null, name: pData[1].name },
          initialServerTeam: 'A'
        });
        setMatchState(defaultMatch);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Reload leaderboard when mode changes
  useEffect(() => {
    fetchLeaderboard(leaderboardMode)
      .then(setLeaderboard)
      .catch(console.error);
  }, [leaderboardMode]);

  // Scoring handlers
  const handleScorePoint = (team) => {
    if (!matchState) return;
    const updated = scorePoint(matchState, team);
    setMatchState(updated);
  };

  const handleUndo = () => {
    if (!matchState) return;
    const reverted = undoPoint(matchState);
    setMatchState(reverted);
  };

  const handleNextGame = () => {
    if (!matchState) return;
    const nextState = startNextGame(matchState);
    setMatchState(nextState);
  };

  const handleSwapEnds = () => {
    if (!matchState) return;
    setMatchState({
      ...matchState,
      endsSwapped: !matchState.endsSwapped
    });
  };

  // Submit completed match to backend
  const handleFinishMatch = async () => {
    if (!matchState || !matchState.isMatchOver) return;

    try {
      setIsSubmittingMatch(true);

      const allGames = [
        ...matchState.completedGames,
        {
          gameNumber: matchState.currentGameNumber,
          scoreA: matchState.scoreA,
          scoreB: matchState.scoreB
        }
      ];

      const payload = {
        match_mode: matchState.mode,
        team_a_p1_id: matchState.teamA.p1.id,
        team_a_p2_id: matchState.teamA.p2?.id || null,
        team_b_p1_id: matchState.teamB.p1.id,
        team_b_p2_id: matchState.teamB.p2?.id || null,
        winner_team: matchState.winnerTeam,
        team_a_games_won: matchState.gamesWonA,
        team_b_games_won: matchState.gamesWonB,
        games_data: allGames
      };

      const result = await submitMatch(payload);
      setLastMatchResult(result);
      setIsEndOpen(true);

      // Refresh data
      loadInitialData();
    } catch (err) {
      alert('Error finalizing match: ' + err.message);
    } finally {
      setIsSubmittingMatch(false);
    }
  };

  // Rematch with the same setup
  const handleRematch = () => {
    if (!matchState) return;
    const freshMatch = createInitialMatchState({
      mode: matchState.mode,
      format: matchState.format,
      targetScore: matchState.targetScore,
      teamA: matchState.teamA,
      teamB: matchState.teamB,
      initialServerTeam: 'A'
    });
    setMatchState(freshMatch);
    setIsEndOpen(false);
    setActiveTab('match');
  };

  // Open Add Player Modal
  const handleOpenAddPlayer = () => {
    setEditingPlayerData(null);
    setIsAddPlayerOpen(true);
  };

  // Open Edit Player Modal
  const handleOpenEditPlayer = (player) => {
    setEditingPlayerData(player);
    setSelectedPlayerId(null);
    setIsAddPlayerOpen(true);
  };

  // Save Player (Create or Update)
  const handleSavePlayer = async (payload, id) => {
    if (id) {
      await updatePlayer(id, payload);
    } else {
      await createPlayer(payload);
    }
    await loadInitialData();
  };

  // Quick player creation (for match setup modal)
  const handleCreatePlayer = async (name) => {
    const randomColors = ['#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#06B6D4'];
    const color = randomColors[Math.floor(Math.random() * randomColors.length)];
    const newP = await createPlayer({ name, avatar_color: color });
    await loadInitialData();
    return newP;
  };

  // Handle player deletion
  const handleDeletePlayer = async (pId) => {
    try {
      await deletePlayer(pId);
      setSelectedPlayerId(null);
      await loadInitialData();
    } catch (err) {
      alert('Failed to delete player: ' + err.message);
    }
  };

  return (
    <div className="app-container">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewMatch={() => setIsSetupOpen(true)}
        overviewStats={overviewStats}
      />

      {/* Main Body */}
      <main className="main-content">
        {activeTab === 'match' && (
          <div>
            {!matchState ? (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏸</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  No Active Match in Progress
                </h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '450px', margin: '0 auto 1.5rem' }}>
                  Select players, configure game settings, and track live scores with official BWF server positioning and court visuals.
                </p>
                <button className="btn-new-match" onClick={() => setIsSetupOpen(true)}>
                  <Play size={18} />
                  <span>Start New Match</span>
                </button>
              </div>
            ) : (
              <div>
                {/* Court Visualizer */}
                <CourtVisualizer matchState={matchState} />

                {/* Scoreboard Controls */}
                <div style={{ marginTop: '1.5rem' }}>
                  <ScoreBoard
                    matchState={matchState}
                    onScorePoint={handleScorePoint}
                    onUndo={handleUndo}
                    onNextGame={handleNextGame}
                    onFinishMatch={handleFinishMatch}
                    onSwapEnds={handleSwapEnds}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView
            leaderboard={leaderboard}
            mode={leaderboardMode}
            setMode={setLeaderboardMode}
            onSelectPlayer={setSelectedPlayerId}
            onOpenAddPlayer={handleOpenAddPlayer}
            isLoading={false}
          />
        )}

        {activeTab === 'players' && (
          <PlayersListView
            players={players}
            onSelectPlayer={setSelectedPlayerId}
            onOpenCreatePlayer={handleOpenAddPlayer}
            onChallengePlayer={(pId) => {
              setSelectedPlayerId(pId);
            }}
          />
        )}

        {activeTab === 'history' && (
          <MatchHistoryView
            matches={matches}
            isLoading={false}
          />
        )}
      </main>

      {/* Match Setup Modal */}
      <MatchSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        players={players}
        onStartMatch={(newConfig) => {
          const freshState = createInitialMatchState(newConfig);
          setMatchState(freshState);
          setActiveTab('match');
        }}
        onCreatePlayer={handleCreatePlayer}
      />

      {/* Match End / Victory Modal */}
      <MatchEndModal
        isOpen={isEndOpen}
        matchResult={lastMatchResult}
        matchState={matchState}
        onGoToLeaderboard={() => {
          setIsEndOpen(false);
          setActiveTab('leaderboard');
        }}
        onRematch={handleRematch}
        onNewMatch={() => {
          setIsEndOpen(false);
          setIsSetupOpen(true);
        }}
      />

      {/* Player Profile & H2H Modal */}
      <PlayerProfileModal
        playerId={selectedPlayerId}
        allPlayers={players}
        onClose={() => setSelectedPlayerId(null)}
        onDeletePlayer={handleDeletePlayer}
        onEditPlayer={handleOpenEditPlayer}
      />

      {/* Add / Edit Player with Custom Rating Modal */}
      <AddPlayerModal
        isOpen={isAddPlayerOpen}
        onClose={() => {
          setIsAddPlayerOpen(false);
          setEditingPlayerData(null);
        }}
        onSavePlayer={handleSavePlayer}
        initialData={editingPlayerData}
      />
    </div>
  );
}
