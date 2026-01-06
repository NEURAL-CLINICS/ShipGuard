# Scanner System

## Finding schema
Each finding is normalized to:
- id
- rule_id
- severity (critical, high, medium, low, info)
- category
- file
- line
- description
- remediation
- scanner_source

## Adapter interface
Adapters map tool output to the common schema and return findings plus metadata.

Default adapters:
- Pattern scanner (regex rules in core rule set)
- Dependency scanner (flags unstable version specs)

Rules live in `backend/src/scanners/rules.ts`.

## Rule sets
- Core OWASP-inspired rules enabled by default.
- Rule groups can be enabled or disabled per project.
- Severity overrides are supported for tuning.

Projects set `ruleSet` on creation or update.

## Adding a scanner
1. Implement an adapter in `backend/src/scanners`.
2. Map tool output into the common schema.
3. Register the adapter in the scanner registry.
4. Add a config entry to enable it for scans.
