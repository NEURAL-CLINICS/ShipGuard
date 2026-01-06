# Threat Model

## Scope
ShipGuard handles code uploads or repository fetches, scan execution, and findings storage.

## Data flows
1. User uploads archive or provides repo URL.
2. API stores metadata and queues scan.
3. Worker fetches code and runs scanners.
4. Findings are normalized and stored.
5. UI retrieves findings for review.

## Trust boundaries
- Public internet to API
- API to database
- API to queue
- Worker to scanner containers
- Worker to storage

## Attack surfaces
- File upload endpoint
- Repo fetch (SSRF or credential misuse)
- Auth endpoints (credential stuffing)
- Dependency scanner execution
- Results export endpoints

## Risks and mitigations
- Malicious archives: validate type, limit size, scan in sandbox.
- SSRF via repo URL: allowlist schemes, block internal IP ranges.
- Scanner escape: run in containers with no host mounts.
- Sensitive data leakage: avoid logging raw code; encrypt storage.
- Credential theft: enforce bcrypt, rate limiting, and MFA-ready auth.
- DoS by large scans: queue limits, per-tenant quotas, timeouts.
- Injection in reports: escape output and sanitize markdown.

## Open items
- Add malware scanning for uploads.
- Implement retention jobs and hard delete.
