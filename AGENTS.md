# Repository Guidelines

## Structure
This repository contains the QuickClock React/TypeScript frontend.
`src/` contains application code, `src/components/` focused UI components,
`src/api.ts` the HTTP client, and `public/` icons and the manifest.
Tests live beside the code as `*.test.ts` or `*.test.tsx`.

## Commands
- `npm ci`: install pinned dependencies.
- `npm run dev`: run Vite; `/api` proxies to `API_PROXY_TARGET` (default localhost:8080).
- `npm test`: run Vitest and Testing Library checks.
- `npm run build`: type-check and create `dist/`.
- `docker compose config --quiet`: validate the local stack after setting .env.
- `docker compose up --build --wait`: build and start frontend, API and PostgreSQL.
- `docker compose down`: stop the stack and preserve the database volume.

Compose lives in this repository and builds the sibling backend. Only the proxy
publishes a port, bound to 127.0.0.1 by default; set the private ZeroTier IP for
phone access. Use a separate Compose project/port for QA. Never remove personal
volumes or expose API/database ports. See README for password and network setup.

## Conventions
Use strict TypeScript, PascalCase components and explicit domain types. Keep
money in integer cents and local dates out of UTC conversions. Never populate
real screens with demo records when the API is unavailable. Handle loading,
empty and error states. Abort stale reads on company changes. Confirm writes
only after API success. Use accessible labels and mobile-first layouts.

## Workflow
Follow Spec 001 in the Flutter reference repo under `specs/001-quickclock/`.
Use branches such as `feat/001-t05-react-foundation` and scoped Conventional
Commits in simple English. Run checks before closing a branch. Approved routine
commits, pushes and verified merges may proceed; production deploy, destructive
data operations and new product rules need separate approval.

## Related Projects
- Flutter/spec: `/mnt/c/projetos/ponto-eletronico`
- Backend: `/mnt/z/Spring/QuickClock`
- Frontend: `/mnt/z/react/QuickClock`

Keep shared product decisions in PROJECT_CONTEXT.md synchronized. First delivery
uses local Docker and HTTP/IP through ZeroTier, without login, DNS or service
worker. Never commit `.env`, backups, personal reports, node_modules or dist.
