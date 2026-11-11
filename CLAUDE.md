# Purrfect Lines

A falling-block puzzle game for the browser. SPEC.md (German) is the source of
truth for scope and decisions.

## Commands

Node.js and Git for Windows run locally on Windows (Git Bash runs the stop
hook).

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

- Never change or refactor an existing test to make something pass. If a test
  seems wrong, or the spec changed the behaviour, report it and propose the
  change. Apply it only after my approval, in its own commit.
- Tests only for behaviour that stays valid in later milestones. Transitional
  behaviour gets no automated test; it goes on the milestone's manual checklist.
- While writing tests before the implementation, create `.claude/.tests-first`
  (an empty, git-ignored file). With the marker the stop hook still runs
  typecheck and lint and blocks on their errors, but skips the unit tests.
  Add stubs first: types, constants (with their spec values) and function
  signatures without behaviour. A stub returns a neutral value (e.g. the
  unchanged state) where that is natural. It throws
  `new Error('Not implemented')` only where no neutral value exists. Stubs
  must pass lint: refer to unused parameters with `void name;`. Tests must
  fail on their assertions, not on missing names or type errors; the only
  accepted exception is the deliberate throw of a stub. Delete the marker
  before implementing. Never implement just to silence the hook.
- Changes to SPEC.md, docs/spec/ and CLAUDE.md that reviewers suggest are my
  decision. Propose them, do not apply them on your own.
- No new dependency without asking me first.
- Keep game logic free of DOM, canvas and audio so it can be unit-tested.
- Never use the brand name of an existing game in code, docs or in-game text.
  Name, colors, graphics and sounds are original.

## Workflow per milestone

1. Create a branch `m<N>-<short-name>` for the milestone (e.g. `m2-controls`).
2. Create `.claude/.tests-first`, add the stubs, then write the tests.
   Typecheck and lint must pass, only the new tests fail. Explain to me in
   chat every new test that already passes, one by one: why it passes
   without the implementation and whether it still checks something real.
   Commit stubs and tests together.
3. Plan in plan mode.
4. Delete `.claude/.tests-first`, then implement and commit.
5. Always run `code-reviewer` with the list of changed files. If documentation
   changed (README, docs/, SPEC.md, CLAUDE.md), also run `docs-reviewer` with
   the same list. Present each finding separately and wait for my decision.
6. Wait for my acceptance; it requires the Definition of Done (SPEC.md,
   section 10). Only then merge into main with `git merge --ff-only`.
7. After acceptance, on main: set `**Status:** erledigt am <date> (Commit <hash>)`
   below the milestone heading in docs/spec/meilensteine.md, with the hash of
   the last implementation commit, tick its checklist and commit this
   separately.

Push only when I ask.

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
