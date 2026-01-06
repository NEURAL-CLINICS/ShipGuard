# Architecture

## Stack decisions
- Backend: Node.js + TypeScript + Express
- Frontend: React 18 + Vite + TypeScript
- Database: Postgres for users, projects, scans, findings
- Queue: Redis-backed job queue (BullMQ-style)
- Storage: S3-compatible object storage for uploads
- Containers: Docker for API, worker, and UI

## Core services
- API service: auth, projects, scans, reports
- Scan worker: runs scanners in isolated containers
- Scanner adapters: normalize tool output into common schema
- UI: dashboard for projects and findings

## Data model (initial)
- users: id, email, password_hash, created_at
- projects: id, owner_id, name, repo_url, rule_set, retention_days, last_upload_path
- scans: id, project_id, status, source_type, source_ref, started_at, finished_at
- findings: id, scan_id, rule_id, severity, category, file, line, description
- rule_sets: id, name, enabled_rules, severity_overrides

## Data flow
1. User registers and creates a project.
2. User connects a repo or uploads an archive.
3. API enqueues a scan job with project settings.
4. Worker pulls job, runs scanners, normalizes findings.
5. API stores findings and exposes reports.

## Trust boundaries
- Public internet to API
- API to worker
- Worker to scanner containers
- API/worker to storage and database

## Deployment notes
- Local dev uses Docker Compose with Postgres and Redis.
- Production uses managed Postgres/Redis and object storage.
- Scan workers should run in a restricted network and sandbox.

## Runtime modes
- Storage defaults to in-memory; set `STORAGE_MODE=postgres` and `DATABASE_URL` to persist.
- Queue defaults to inline; set `QUEUE_MODE=redis` and `REDIS_URL` to enable BullMQ workers.
