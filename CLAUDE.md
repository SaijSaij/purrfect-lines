# Purrfect Lines

A falling-block puzzle game for the browser. SPEC.md (German) is the source of
truth for scope and decisions.

## Commands

Node.js runs locally on Windows.

- `npm ci` – install dependencies from the lockfile
- `npm run serve` – dev server on http://localhost:5173
- `npm test` – unit tests (Vitest)
- `npm run e2e` – browser tests (Playwright, Chromium)
- `npm run lint` – ESLint
- `npm run typecheck` – `tsc --noEmit`
- `npm run build` – typecheck and build into `dist/`
- `npm run preview` – serve the built `dist/` on http://localhost:4173
- `npm run check` – typecheck + lint + unit tests (what the stop hook runs)
- `npm run check:release` – build and verify that no debug code is in `dist/`
  (part of the Definition of Done)

Run project commands via the npm scripts from the project root, never via npx,
and without cd, pipes or redirects. The one exception is
`npx playwright install chromium` (see Pitfalls): the user runs it, not Claude.

## Rules

- Never change an existing test to make it pass. If you think a test is wrong,
  report it and explain why.
- No new dependency without asking me first.
- Keep game logic free of DOM, canvas and audio so it can be unit-tested.
- Never use the brand name of an existing game in code, docs or in-game text.
  Name, colors, graphics and sounds are original.

## Versions

- Node.js 26 LTS.
- TypeScript is pinned to 6.0.x: typescript-eslint does not support TypeScript 7
  yet. Upgrade only together with typescript-eslint.
- All dependencies are pinned to exact versions.

## Pitfalls

- `.npmrc` sets `ignore-scripts=true`: packages never run install scripts. If a
  new package needs one, ask me instead of turning the setting off.
- Playwright's Chromium lives in `%LOCALAPPDATA%\ms-playwright`. After upgrading
  `@playwright/test`, ask the user to run `npx playwright install chromium`.
- `npm audit` reports a moderate minimatch issue inside ESLint's dependencies.
  It only affects lint-time glob matching and is accepted.
