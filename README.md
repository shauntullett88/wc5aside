# ⚽ WC5Aside — World Cup 5-a-Side Fantasy Game

A full-stack Next.js fantasy football app for the 2026 FIFA World Cup. Pick 5 midfielders/forwards, the player who scores the most goals wins.

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
cd wc5aside
npm install
```

### 2. Add your API key

Open `.env.local` and replace `YOUR_API_KEY_HERE` with your API-Football key:

```env
API_FOOTBALL_KEY=abc123yourkeyhere
```

**Get a free key at:** https://www.api-football.com/  
(Free tier: 100 requests/day — enough for testing)

### 3. Run the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### 4. Seed player data

On first run, mock player data is loaded automatically. To load REAL players from API-Football:

```bash
curl -X POST http://localhost:3000/api/admin/seed
```

Or visit http://localhost:3000/api/admin/seed in a tool like Postman/Insomnia.

---

## 📁 Project Structure

```
wc5aside/
├── pages/
│   ├── index.js            ← Team selection / lock-in page
│   ├── leaderboard.js      ← Live leaderboard
│   ├── _app.js             ← Theme context (dark/light)
│   └── api/
│       ├── players.js      ← GET players with filters
│       ├── teams.js        ← GET/POST fantasy teams
│       ├── cron.js         ← POST trigger goal sync
│       ├── status.js       ← GET system health
│       └── admin/
│           └── seed.js     ← POST seed players from API
├── components/
│   ├── Navbar.js           ← Navigation + theme toggle
│   └── PlayerCard.js       ← Player display card
├── lib/
│   ├── db.js               ← SQLite database layer
│   ├── apiFootball.js      ← API-Football client
│   ├── syncGoals.js        ← Background goal sync worker
│   └── mockPlayers.js      ← Fallback data (no API key needed)
├── styles/
│   └── globals.css         ← Tailwind + custom styles
├── .env.local              ← API keys (not committed to git)
├── next.config.js
├── tailwind.config.js
└── fantasy.db              ← SQLite DB (auto-created on first run)
```

---

## 🔑 API Key Setup (Detailed)

1. Go to https://www.api-football.com/
2. Click "Get Started for Free"
3. Register and verify your email
4. From your dashboard, copy your **API Key**
5. Open `.env.local` in the project root
6. Replace `YOUR_API_KEY_HERE` with your key:
   ```
   API_FOOTBALL_KEY=your_actual_key_here
   ```
7. Restart the dev server (`npm run dev`)
8. Seed players: `curl -X POST http://localhost:3000/api/admin/seed`

---

## 🏆 App Features

### Team Selection Page (`/`)
- Enter your name (unique identifier)
- Browse midfielders & forwards from 16 top World Cup nations
- Filter by team, position, or search by name
- Select exactly 5 players
- Lock-in with confirmation: "Are you sure? You cannot change your team after locking in."
- Team is permanently locked in the database

### Live Leaderboard (`/leaderboard`)
- All teams ranked by total goals (highest first)
- Individual player goal tallies shown per team
- Auto-refreshes every 10 minutes
- Live countdown to next refresh
- Manual "Refresh Now" button
- Status banner showing API connection and last sync time

---

## ⚙️ Goal Sync Logic

### How goals are counted

Every 10 minutes, `/api/cron` is called which:

1. Fetches all finished/live World Cup fixtures from API-Football
2. For each fixture, fetches all match events
3. Filters events where:
   - `event.type === 'Goal'` ✅
   - `event.detail !== 'Own Goal'` ✅ (own goals are NEVER counted)
4. For each valid goal:
   - Checks the `processed_events` table for `(fixture_id, event_index)`
   - If not seen before: increments the player's goal count
   - Marks the event as processed (prevents double-counting)
5. Logs the sync run

### Deduplication

The `processed_events` table stores a composite key of `(fixture_id, event_index)`. Since event positions in a fixture's event array are stable once the match ends, this reliably prevents any goal being counted twice across multiple sync runs.

### Own-goal filtering

```javascript
// In lib/apiFootball.js → extractValidGoals()
events.forEach((event, index) => {
  if (event.type !== 'Goal') return;         // Must be a goal
  if (event.detail === 'Own Goal') return;   // EXCLUDE own goals
  // ... count this goal
});
```

---

## 🗃️ Database Schema

**players** — Cached player data with goal totals  
**fantasy_teams** — User teams (always locked=1 after creation)  
**processed_events** — Seen match events (deduplication)  
**sync_log** — History of sync runs

---

## 🌐 Setting Up External Cron (Production)

For production, set up an external cron to call the sync endpoint every 10 minutes:

**Option 1: cron-job.org (free)**
- URL: `https://yourdomain.com/api/cron`
- Method: POST
- Schedule: every 10 minutes

**Option 2: Vercel Cron (if deploying to Vercel)**
Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron",
    "schedule": "*/10 * * * *"
  }]
}
```

**Secure it with a secret:**
```env
CRON_SECRET=your_random_secret_here
```
Then pass `Authorization: Bearer your_random_secret_here` in your cron request headers.

---

## 🔧 World Cup League ID

The app is configured for FIFA World Cup 2026 (league ID `1` in API-Football). If needed, verify the correct ID at:
https://www.api-football.com/documentation-v3#tag/Leagues

Update in `.env.local`:
```env
WORLD_CUP_LEAGUE_ID=1
WORLD_CUP_SEASON=2026
```

---

## 📱 Design

- Dark/light mode toggle (top-right of navbar)
- Mobile-responsive layout
- Glassmorphism card design
- Pitch-green and gold colour palette
- Position badges: FWD (red) · MID (amber)
- Country flag emojis on all player/team references
- Animated goal progress bars on leaderboard

---

## 🛠️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | Next.js 14 · React 18               |
| Styling   | Tailwind CSS 3                      |
| Backend   | Next.js API Routes (Node.js)        |
| Database  | SQLite via better-sqlite3           |
| Live Data | API-Football (api-sports.io)        |
| Cron      | Client-side polling + external cron |

---

## 🚨 Important Notes

- **Free API tier**: 100 requests/day. The seed step uses ~16 requests (one per team). The goal sync uses 1 request per fixture (up to ~64 matches in the World Cup). Plan accordingly or upgrade your API plan.
- **Mock data**: If no API key is set, the app auto-loads 64 mock players so you can test the full UI flow.
- **SQLite**: The `fantasy.db` file is created automatically in the project root on first run.
