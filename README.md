# Runners Log

A Couch to 5K running tracker PWA built with Vite and React.

## Features

- Full 9-week Couch to 5K program with interval timer
- Timestamp-based timer (accurate even after pauses)
- System notifications for interval changes
- In-app sound cues while the app is open
- Optional GPS distance tracking (best effort while app is foregrounded)
- Screen Wake Lock during workouts
- Run history stored locally (IndexedDB)
- Installable PWA with offline support

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy

Build the `dist/` folder and deploy to any static host (Netlify, Cloudflare Pages, GitHub Pages, etc.). HTTPS is required for PWA features.

## **FUTURE IMPROVEMENT**
dedicated app functionality
