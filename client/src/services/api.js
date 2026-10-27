const BASE_URL = '/api';

export async function fetchPlayers() {
  const res = await fetch(`${BASE_URL}/players`);
  if (!res.ok) throw new Error('Failed to fetch players');
  return res.json();
}

export async function createPlayer(playerData) {
  const body = typeof playerData === 'string'
    ? { name: playerData, avatar_color: '#10B981' }
    : playerData;

  const res = await fetch(`${BASE_URL}/players`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create player');
  }
  return res.json();
}

export async function updatePlayer(id, playerData) {
  const res = await fetch(`${BASE_URL}/players/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(playerData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update player');
  }
  return res.json();
}

export async function fetchPlayerDetails(id) {
  const res = await fetch(`${BASE_URL}/players/${id}`);
  if (!res.ok) throw new Error('Failed to fetch player details');
  return res.json();
}

export async function fetchH2H(p1Id, p2Id) {
  const res = await fetch(`${BASE_URL}/players/${p1Id}/h2h/${p2Id}`);
  if (!res.ok) throw new Error('Failed to fetch head to head stats');
  return res.json();
}

export async function fetchLeaderboard(mode = 'all') {
  const res = await fetch(`${BASE_URL}/leaderboard?mode=${mode}`);
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}

export async function fetchOverviewStats() {
  const res = await fetch(`${BASE_URL}/leaderboard/overview`);
  if (!res.ok) throw new Error('Failed to fetch overview stats');
  return res.json();
}

export async function fetchMatches(limit = 30) {
  const res = await fetch(`${BASE_URL}/matches?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch matches');
  return res.json();
}

export async function submitMatch(payload) {
  const res = await fetch(`${BASE_URL}/matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to submit match');
  }
  return res.json();
}

export async function deletePlayer(id) {
  const res = await fetch(`${BASE_URL}/players/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to delete player');
  }
  return res.json();
}

