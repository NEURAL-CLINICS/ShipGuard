# Contributing to ShipGuard

Thanks for helping improve ShipGuard. This repo is a monorepo with backend and frontend packages.

## Development setup
- Node.js 20+
- pnpm 9+

Install deps:
```bash
pnpm install
```

Common scripts:
- `pnpm dev` - run backend and frontend in watch mode
- `pnpm lint` - lint all packages
- `pnpm test` - run tests
- `pnpm build` - build all packages

## Pull requests
- Keep changes focused and avoid drive-by refactors.
- Include tests or explain why they are not needed.
- Update docs when you change behavior or APIs.
- Fill in the PR template with verification steps.

## Code style
- TypeScript is strict; avoid `any` and unsafe casts.
- Prefer explicit input validation and clear error handling.
- Do not log sensitive data or uploaded code.

## Reporting security issues
Email security@shipguard.local or open a private issue if possible.
