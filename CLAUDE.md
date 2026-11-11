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
- `npm run screenshots` – render the pictures in `docs/images/` (not part of
  `npm run check`)

Developer documentation for humans: `docs/DEVELOPMENT.md`.

Run project commands via the npm scripts from the project root, never via npx,
and without cd, pipes or redirects. The one exception is
`npx playwright install chromium` (see Pitfalls): the user runs it, not Claude.
Run each command as its own tool call. Write commit messages with several `-m`
flags, never with a heredoc.

## Rules

- Never change or refactor a test of an earlier milestone to make something
  pass. If such a test seems wrong, or the spec changed the behaviour, report
  it and propose the change. Apply it only after my approval, in its own
  commit. Tests of the current milestone follow steps 2 and 4 of the workflow.
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
   Typecheck and lint must pass, only the new tests fail. Commit stubs and
   tests together without waiting for my approval and go straight to step 3.
   Until the implementation starts, adjust tests of the current milestone when
   I point something out. Show me the tests only when I ask for them.
3. Plan in plan mode. Present together with the plan:
   - a short mapping table: requirement, number and names of its tests, one
     row per requirement;
   - special cases: new tests that already pass (why, and whether they still
     check something real), needed changes to existing tests with their diff,
     requirements without a test and why;
   - assumptions where the spec was ambiguous.
   Leave out special cases and assumptions when there are none.
4. Delete `.claude/.tests-first`, then implement and commit. If a test of the
   current milestone fails during implementation, say whether the test or the
   code is wrong. Fix a wrong test in its own commit, with a one-sentence
   reason in the commit message.
5. Always run `code-reviewer` with the list of changed files. If documentation
   changed (README, docs/, SPEC.md, CLAUDE.md), also run `docs-reviewer` with
   the same list. Present each finding separately and wait for my decision.
   Tests that a review suggests after the implementation go in their own
   commit, and its message says that they were never red.
6. Before asking for my acceptance, show me the start command, the
   milestone's checklist with action and expected result for each item, and
   the transitional behaviour. If nothing needs checking by hand, say so.
   Never tick anything yourself. Wait for my acceptance; it requires the
   Definition of Done (SPEC.md, section 10). Only then merge into main with
   `git merge --ff-only`. Before asking for acceptance, also show a short
   overview of what is still open, one line per item, split into "needs my
   decision" and "for information only": open or deferred findings (also
   rejected KANN findings), changes to the spec, docs or CLAUDE.md that were
   proposed but not applied, approved assumptions that have no entry in the
   spec, and checklist items that were not checked. If nothing is open, one
   sentence is enough. Whatever can be settled now still belongs on the
   branch.
7. After acceptance, on main: set `**Status:** erledigt am <date> (Commit <hash>)`
   below the milestone heading in docs/spec/meilensteine.md, tick its
   checklist and commit this separately. The hash is the state of the branch
   at the merge: what `git rev-parse --short HEAD` prints right before the
   status commit. After that, only name what is left in Git (commits not
   pushed, a local branch that is left over) and ask whether to push.

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
