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
