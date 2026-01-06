# Onboarding

## Local setup
1. Install Node.js 20+ and pnpm.
2. Copy env files:
   - `cp backend/.env.example backend/.env`
   - `cp infra/.env.example infra/.env`
3. Start services:
   - `pnpm install`
   - `pnpm dev`

## Docker setup
1. `docker compose -f infra/docker-compose.yml --env-file infra/.env.example up --build`

## First scan
1. Register a user in the UI.
2. Create a project and connect a repo URL or upload a zip archive.
3. Trigger a scan and review findings in the dashboard.
