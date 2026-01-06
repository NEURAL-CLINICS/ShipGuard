# Product Overview

## Personas
- Indie developer preparing to launch
- Small dev team needing a pre-release security check

## Key workflows
1. User signs up and logs in.
2. User creates a project and connects a repo or uploads an archive.
3. User runs a scan for a branch or commit.
4. User reviews findings and decides whether it is safe to ship.

## Non-functional requirements
- Performance: scans complete quickly for small and medium repos.
- Privacy: user code is never shared without explicit consent.
- Reliability: partial results are returned if a scanner fails.
- Usability: findings are grouped by severity and easy to filter.
