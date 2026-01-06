# Rule Sets

Rule sets define the default security checks for a project.

## Default rule sets
- `core`: OWASP-inspired baseline rules.

## Project configuration
Provide `ruleSet` when creating a project, or update later:
- `POST /api/projects`
- `POST /api/projects/:id/repo` (update metadata only)

## Extending
Add new rules in `backend/src/scanners/rules.ts` and register a new rule set entry.
