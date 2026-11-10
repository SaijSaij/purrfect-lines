# Purrfect Lines

A falling-block puzzle game for the browser. SPEC.md (German) is the source of
truth for scope and decisions.

## Commands

Everything runs in Docker through `./dev`. Never run `npm`, `npx` or `node` on the
host; Node.js is not installed there.

- `./dev install` – install dependencies from the lockfile (`npm ci`)
- `./dev serve` – dev server on http://localhost:5173
- `./dev test` – unit tests (Vitest)
- `./dev e2e` – browser tests (Playwright, Chromium)
- `./dev lint` – ESLint
- `./dev typecheck` – `tsc --noEmit`
- `./dev build` – typecheck and build into `dist/`
- `./dev check` – typecheck + lint + unit tests (what the stop hook runs)
- `./dev npm …` – any other npm command in the container
- `./dev rebuild` – rebuild the image after changing the Dockerfile

## Rules

- Never change an existing test to make it pass. If you think a test is wrong,
  report it and explain why.
- No new dependency without asking me first.
- Keep game logic free of DOM, canvas and audio so it can be unit-tested.
- Never use the brand name of an existing game in code, docs or in-game text.
  Name, colors, graphics and sounds are original.

## Versions

- TypeScript is pinned to 6.0.x: typescript-eslint does not support TypeScript 7
  yet. Upgrade only together with typescript-eslint.
- Node 26 runs inside the container (`node:26-trixie-slim`).
- The Playwright version in the Dockerfile must match `@playwright/test` in
  package.json. Run `./dev rebuild` after changing it.
- All dependencies are pinned to exact versions.

## Pitfalls

- Vite watches files by polling, because change events do not cross the Windows
  bind mount.
- `node_modules` lives on the host but contains Linux binaries.
- The stop hook needs Docker Desktop running.
- `npm audit` reports a moderate minimatch issue inside ESLint's dependencies.
  It only affects lint-time glob matching and is accepted.
