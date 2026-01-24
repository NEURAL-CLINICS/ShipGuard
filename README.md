# ShipGuard

ShipGuard is an automated security assessment service focused on codebases close to release.
It provides a fast, actionable security posture overview so teams can decide if they are ready to ship.

## Core features
- Pre-release scans with prioritized findings
- Unified findings schema across multiple scanners
- Project-level access control and secure auth
- Report export (JSON and Markdown) for release reviews
- Pluggable scanner adapters and configurable rule sets

## Quickstart
Prereqs:
- Node.js 20+
- pnpm 9+

Install dependencies:
```bash
pnpm install
```

Configure env:
```bash
cp backend/.env.example backend/.env
```

Start dev servers:
```bash
pnpm dev
```

Backend runs at http://localhost:3001
Frontend runs at http://localhost:5173

Run full stack with Docker:
```bash
docker compose -f infra/docker-compose.yml --env-file infra/.env.example up --build
```

## Deployment (containers)

ShipGuard ships as 3 containers: `backend` (API), `worker` (scan runner), and `frontend` (static UI).

Local/Compose:
```bash
cp infra/.env.example infra/.env
docker compose -f infra/docker-compose.yml --env-file infra/.env up --build
```

Production notes:
- `JWT_SECRET` must be 16+ characters.
- For persistence, set `STORAGE_MODE=postgres` and provide `DATABASE_URL`.
- For background workers, set `QUEUE_MODE=redis` and provide `REDIS_URL`.
- Frontend requires `VITE_API_URL` at build time (e.g. `https://api.example.com`).

## Repo layout
- backend: API and scan orchestration
- frontend: React dashboard
- infra: Docker and local stack
- docs: Architecture, threat model, and guides

## Security and privacy
ShipGuard stores only minimal metadata and findings.
Uploaded code is handled transiently and is never logged.

## Self scan
Generate a self-security report from the repo:
```bash
pnpm --filter @shipguard/backend self-scan
```

## License
MIT
