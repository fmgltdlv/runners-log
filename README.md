# Runners Log

A Couch to 5K running tracker and strength training PWA built with Vite, React, and Cloudflare Workers + D1.

## Features

### Running (C25K)
- Full 9-week Couch to 5K program with interval timer
- Timestamp-based timer (accurate even after pauses)
- System notifications for interval changes
- Optional GPS distance tracking
- Run history synced to D1 (with offline IndexedDB fallback)

### Strength Training
- Pre-built workout plans for machines and free weights:
  - **Machine Full Body** — 3-day beginner routine
  - **Machine Upper / Lower** — 4-day split
  - **Free Weight Foundation** — barbell and dumbbell basics
- Set logging with weight and reps
- Automatic rest timer between sets
- Session history synced to D1

### General
- Installable PWA with offline support
- Screen Wake Lock during runs

## Development

```bash
npm install

# Apply local D1 migrations
npm run db:migrate

# Terminal 1 — API + D1 (port 8787)
npm run dev:api

# Terminal 2 — Vite frontend (proxies /api to Worker)
npm run dev
```

## Build & Deploy

```bash
npm run build
npm run deploy
```

### First-time Cloudflare setup

1. Create a D1 database and update `wrangler.toml` with the real `database_id`:

```bash
npx wrangler d1 create runners-log-db
```

2. Apply migrations to production:

```bash
npm run db:migrate:remote
```

3. Deploy the Worker (serves both API and static assets from `dist/`):

```bash
npm run deploy
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET/POST/DELETE | `/api/runs` | Run history |
| GET | `/api/plans` | List strength plans |
| GET | `/api/plans/:id?day=N` | Plan details |
| GET/POST/DELETE | `/api/strength-sessions` | Strength workout logs |

## Data Storage

- **D1** — primary store for runs, plans, and strength sessions
- **IndexedDB** — offline cache; writes sync to D1 when online
- **localStorage** — user settings (week/day, plan selection, toggles)
