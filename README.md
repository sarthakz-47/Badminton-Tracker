# 🏸 SmashRank — Badminton Score Tracker & Elo Rating Leaderboard

A full-stack, BWF-standard Badminton Scorekeeper and Elo Rating Leaderboard web application.

---

## 🌟 Key Features

### 1. 🏸 Interactive Match Scorekeeper (BWF Rules)
* **Official Rally Point System:** Games to 21 (deuce at 20-20, win by 2, cap at 30) or custom sprint scores (15 / 11 points).
* **Singles & Doubles Match Modes:** Complete support for 1v1 Singles and 2v2 Doubles.
* **Top-down 2D Court Visualizer:**
  * Displays official BWF badminton court lines (Center line, Short service line, Singles side tramlines, Doubles long service line, and Net).
  * Automatically calculates and highlights who is **Serving** (🏸) and **Receiving** (🎯) in real-time.
  * Dynamically maps Even scores to the Right Service Court and Odd scores to the Left Service Court.
  * Manages official doubles box rotation when points are won on serve vs. side-outs.
* **Instant Controls:**
  * Huge touch/click score buttons (+1 point).
  * One-tap **Undo Point** with a history state machine.
  * **11-Point Interval Alert** for mid-game break.
  * **Game Point** and **Match Point** glow indicators.
  * **Swap Ends** (manual or automatic at game intervals and deciding games).

### 2. 🏆 Elo Rating Engine & Leaderboard
* **Dynamic Elo Rating Engine:**
  * Calibrated $K$-factors ($K = 32$ placement calibration for newcomers, $K = 20$ standard).
  * Margin of victory scaling (decisive victories reward slightly higher Elo deltas).
  * Doubles Team Elo calculation (averaging partner ratings, updating both players' individual ratings atomically).
* **Tiered Rankings:**
  * 👑 **Smash Elite** (1700+ Elo)
  * 💎 **Master** (1500 – 1699 Elo)
  * 🥇 **Advanced** (1300 – 1499 Elo)
  * 🥈 **Club Player** (1100 – 1299 Elo)
  * 🥉 **Novice** (< 1100 Elo)
* **Leaderboard Filters:**
  * Toggle between **Singles**, **Doubles**, and **Combined** rankings.
  * Player search filter, win rates, winning streaks (🔥 / ❄️), and recent form pills (`[W] [W] [L] [W] [W]`).

### 3. 👥 Player Profiles & Head-to-Head (H2H)
* Inspect any player's career statistics, singles rating, doubles rating, and recent match history.
* **Interactive Head-to-Head tool:** Select any two players to see their total face-off count, win/loss comparison, and past match results.

### 4. 📜 Match History Archive
* Full chronological log of all completed matches with team rosters, game scores, and Elo delta adjustments ($+18$ / $-18$).

---

## 🛠️ Tech Stack & Architecture

* **Frontend:** React 19, Vite, Lucide Icons, Canvas Confetti, CSS Glassmorphism design system.
* **Backend:** Node.js, Express, REST API.
* **Database:** SQLite (`better-sqlite3` with WAL mode & atomic transactions).

---

## 🚀 Running the Project

### 1. Backend Server
```bash
cd server
npm install
npm run dev
# Running on http://localhost:5000
```

### 2. Frontend Web App
```bash
cd client
npm install
npm run dev
# Running on http://localhost:3000
```
