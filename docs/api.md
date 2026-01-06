# API Overview

Base URL: `http://localhost:3001`

## Auth
- `POST /api/auth/register` { email, password }
- `POST /api/auth/login` { email, password }
- `POST /api/auth/forgot` { email }
- `POST /api/auth/reset` { token, password }
- `GET /api/auth/me`

## Projects
- `GET /api/projects`
- `POST /api/projects` { name, repoUrl?, retentionDays?, ruleSet? }
- `GET /api/projects/:id`
- `PATCH /api/projects/:id` { name?, repoUrl?, retentionDays?, ruleSet? }
- `DELETE /api/projects/:id`
- `POST /api/projects/:id/repo` { repoUrl }
- `POST /api/projects/:id/archive` multipart form field `archive`
- `POST /api/projects/:id/local-source` { path } (requires ALLOW_LOCAL_SOURCE=true)
- `GET /api/projects/:id/scans`
- `POST /api/projects/:id/scans` { branch?, sourceType?, sourceRef? }

## Scans
- `GET /api/scans/:id`
- `GET /api/scans/:id/findings`

## Reports
- `GET /api/reports/projects/:id?format=json|markdown`

## Scanners
- `GET /api/scanners`
