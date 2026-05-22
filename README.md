# Digital Signage

[![DigitalOcean](https://img.shields.io/badge/Deployed%20on-DigitalOcean-0080FF?logo=digitalocean)](https://www.digitalocean.com)
[![Docker](https://img.shields.io/badge/Container-Docker-2496ED?logo=docker)](https://www.docker.com)
[![Bun](https://img.shields.io/badge/Runtime-Bun-000000?logo=bun)](https://bun.sh)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?logo=express)](https://expressjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

A digital signage application displaying real-time air quality and weather information for MWIT, powered by IQAir and Open-Meteo APIs.

## Features

- **Real-time Data** - Live air quality (AQI) from IQAir and weather from Open-Meteo
- **Thai Language Support** - Full Thai language interface
- **Seasonal Theme** - Winter decorations (snowflakes/frost) Dec-Feb
- **Smart Caching** - 30-min AQI / 15-min weather cache, serves stale data on API failure
- **Fully Self-Hosted Assets** - Tailwind CSS, Twemoji, and fonts are vendored; no external CDN needed at runtime
- **LG webOS Signage Compatible** - Tested target: webOS Signage 6.0 / 6.1 (Chromium 79)

## Tech Stack

- Bun runtime + Express.js 5
- Vanilla JavaScript (ES5)
- Tailwind CSS 2.2.19 (self-hosted)
- IQAir API + Open-Meteo API

## Quick Start

```bash
cp .env.example .env      # then edit .env and set IQAIR_KEY
bun install
bun start                 # or: bun run dev  (auto-reload)
```

Open http://localhost:3000

## Docker

```bash
cp .env.example .env      # set IQAIR_KEY
docker compose up -d --build
```

The container runs as a non-root user, restarts automatically (`unless-stopped`),
and includes a healthcheck against `/api/time`.

Without compose:

```bash
docker build -t digital-signage .
docker run -d --name digital-signage -p 3000:3000 --env-file .env --restart unless-stopped digital-signage
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/air-quality` | Air quality (AQI) data, 30-min cache |
| `GET /api/weather` | Weather data from Open-Meteo, 15-min cache |
| `GET /api/time` | Current server time (Asia/Bangkok), no cache |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `IQAIR_KEY` | Yes | Your IQAir API key |
| `PORT` | No | Server port (default: 3000) |

## LG webOS Signage Deployment

Target hardware: LG webOS Signage 6.0 / 6.1 (e.g. **55UL3J-NP**, SW 04.01.30).
These panels run a **Chromium 79** browser engine.

1. Host this app on a server reachable from the signage LAN (Docker recommended).
2. On the display, open **Settings -> URL Launcher** (or use SuperSign CMS) and
   point it at the server URL, e.g. `http://<server-ip>:3000`.
3. All front-end assets are self-hosted, so the signage only needs to reach
   this server - no access to Google Fonts / unpkg / jsDelivr is required.

> The UL3J series is a Full HD (1920x1080) panel. The CSS includes a Full HD
> layout pass; verify sizing on the actual display and adjust if needed.

## License

[MIT](./LICENSE)
