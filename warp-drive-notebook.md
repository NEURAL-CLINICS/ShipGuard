# ShipGuard Local Runbook (Warp Drive Notebook)

## Quickstart (local dev, memory storage)
```bash
cd /Users/blucid/ShipGuard
pnpm install
cp backend/.env.example backend/.env
cp infra/.env.example infra/.env
perl -pi -e 's/^JWT_SECRET=.*/JWT_SECRET=dev-secret-dev-secret/' backend/.env
pnpm dev
```

```bash
# macOS: open the UI in a browser
open http://localhost:5173
```

Notes:
- Backend: http://localhost:3001
- Frontend: http://localhost:5173 (Vite may choose 5174 if 5173 is busy)
- Stop dev servers with Ctrl+C

## If the frontend port changes
```bash
perl -pi -e 's|^ALLOWED_ORIGINS=.*|ALLOWED_ORIGINS=http://localhost:5174|' backend/.env
```
Restart `pnpm dev` after changing the port.

## Enable local source scans (optional)
```bash
perl -pi -e 's/^ALLOW_LOCAL_SOURCE=.*/ALLOW_LOCAL_SOURCE=true/' backend/.env
perl -pi -e 's|^LOCAL_SOURCE_ROOT=.*|LOCAL_SOURCE_ROOT=/Users/blucid|' backend/.env
```

## Full stack with Docker Compose (optional)
```bash
docker compose -f infra/docker-compose.yml --env-file infra/.env up --build
```

```bash
# stop and clean
docker compose -f infra/docker-compose.yml --env-file infra/.env down -v
```

## Verify
```bash
pnpm test
```

## Self-scan
```bash
pnpm --filter @shipguard/backend self-scan
```
