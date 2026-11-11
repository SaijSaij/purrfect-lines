# Developing Purrfect Lines

How to work on the game: setup, checks, test helpers and where things are.
How to play is in the [README](../README.md). The plan, the numbered
requirements (A1, A2, …) that code comments refer to and the milestones are in
[SPEC.md](../SPEC.md) and [docs/spec/](spec/) (in German).

Rules, commands and the workflow that Claude Code follows are in
[CLAUDE.md](../CLAUDE.md). This page links there instead of repeating them.

## Prerequisites

- Windows (the setup is only tested there) and Node.js 26 LTS
  (`winget install OpenJS.NodeJS.LTS`). The exact versions are listed under
  [Versions in CLAUDE.md](../CLAUDE.md#versions).
- Git for Windows: its Git Bash runs the stop hook of Claude Code
  (`.claude/hooks/stop-check.sh`).
- Free ports 5173 (dev server, also used by the browser tests and
  `npm run screenshots`) and 4173 (`npm run preview`).
- Playwright's Chromium for the browser tests, installed once (and again after
  upgrading `@playwright/test`):

  ```bash
  npx playwright install chromium
  ```

  Playwright downloads browsers only through this command, not through
  `npm ci`.

## Commands

All commands are npm scripts, run from the project root. The full list is in
[Commands in CLAUDE.md](../CLAUDE.md#commands). Good to know beyond that list:

- `npm run check` runs typecheck, lint and unit tests. It does not run the
  browser tests or the release check.
- `npm run e2e` starts the dev server itself, or reuses one already running on
  port 5173, so stop an outdated one first.
- `npm run check:release` overwrites `dist/`.
- A milestone is done only when the checks of the Definition of Done pass
  (SPEC.md, section 10).

## Testing

The game rules in `src/game/` have no DOM, canvas or clock: they get actions
and the elapsed milliseconds (`update(deltaMs)`) from outside, and the piece
sequence comes from a seeded random generator. That is why almost everything
is covered by unit tests (Vitest, `src/**/*.test.ts`) with controlled time.
Browser tests (Playwright, `e2e/`) cover what only works together: screens,
keys, focus and window size. They read the game state through the test
interface below instead of comparing pixels.

To run one test file, pass it after `--`, e.g. `npm test -- src/game/pause.test.ts`
or `npm run e2e -- e2e/screens.spec.ts`.

Which requirement is checked how is in
[docs/spec/teststrategie.md](spec/teststrategie.md).

## Test helpers (development server only)

These only work with `npm run serve`. The release build does not contain them,
and `npm run check:release` verifies that. Helpers can be combined with `&`,
e.g. http://localhost:5173/?seed=1&level=10&debug.

| Helper | Effect |
|---|---|
| `?seed=<integer>`, e.g. http://localhost:5173/?seed=1 | Fixed piece sequence: the same seed always gives the same pieces, also for new games started with Enter. Invalid values are ignored and reported in the browser console. |
| `?level=<1–99>`, e.g. http://localhost:5173/?level=15 | Every game starts on this level; the level still rises every 10 rows from there. Only whole numbers from 1 to 99; anything else is ignored and reported in the console. |
| `?slow=<1–10>`, e.g. http://localhost:5173/?slow=4 | The whole game runs this many times slower: falling, lock delay, key repeat and the line clear animation. Only whole numbers from 1 to 10; anything else is ignored and reported in the console. |
| `?debug` | Shows internal values as text at the top left: level, fall interval, time left until the resting piece locks and restarts used, the pieces left in the current bag, the seed, the slow motion factor and frames per second. Times are game time, so with `?slow` they stay the same while the game runs slower. |
| `window.__purrfectLines` | Read-only game state for browser tests, a fresh copy on every read. Fields: `screen` (`"start"`, `"playing"`, `"paused"`, `"gameOver"`, `"nameEntry"` or `"highscores"`), `board` (20 rows × 10 cells, piece letter or `null`), `active` (`{ type, cells }` with 0-based `x`/`y`, or `null`), `next` (piece letter), `score`, `lines`, `level`. While full rows light up (300 ms), they are still in `board`, `active` is `null`, and `score` and `lines` already count them. On the start screen, `board` and `active` belong to a throwaway game that Enter replaces. On `gameOver`, `nameEntry` and `highscores`, all fields show the finished game. Try `window.__purrfectLines.screen` in the browser console. |

## Saved data

The high score list and the settings (so far only the last entered name) are
in the browser's localStorage under `purrfect-lines.highscores` and
`purrfect-lines.settings`, as JSON. Every origin has its own storage, so the
development server (port 5173) and `npm run preview` (port 4173) keep separate
lists. To start over, delete both keys in the browser's developer tools
(Application → Local storage) or run `localStorage.clear()` in the console of
the game's tab, which empties the storage of that origin.
Browser tests start with an empty storage in every test.

All storage access goes through `src/storage/persistence.ts`, which never
throws: unreadable data is replaced by an empty list or the default settings,
and if the storage is blocked or full the game keeps the list in memory and
the start screen shows a hint. To see that hint, block site data for
localhost in the browser settings. The browser test for this case
(`e2e/highscores.spec.ts`) makes every access to `window.localStorage` throw
with an init script instead.

## Screenshots

```bash
npm run screenshots
```

Renders the pictures in [docs/images/](images/) with Playwright: start
screen, a game in progress, a row lighting up, the pause menu and the game
over screen, plus the animated `gameplay.apng.png` for the README. The scenes
are in `scripts/screenshots.spec.ts`. They use `?seed=1` and, where a piece
falls, `?slow=10`, so the still pictures come out the same on every run. The
animation runs at normal speed and its timing varies a little; the run fails
if its row is not cleared. Its frames go to `test-results/screenshots/`
(git-ignored), where `scripts/make-apng.js` joins them using only Node itself,
so that script only works after the screenshot tests. The README uses the
animation and three of the stills; `gameplay.png` and `line-clear.png` are
spare. The command is not part of `npm run check`; run it when the look of the
game changes.

## Tuning

The timings (fall intervals per level, repeat delay and interval, lock delay
and its restarts, line clear animation), the points, the maximum name length
and the size of the high score list are in
[src/game/constants.ts](../src/game/constants.ts). Tests refer to these
names, never to the numbers. All colors are in
[src/render/palette.ts](../src/render/palette.ts), all visible texts in
[src/i18n/texts.ts](../src/i18n/texts.ts).

## Project structure

| Path | Content |
|---|---|
| `src/game/` | Game rules without browser APIs, unit-tested; `testing.ts` holds helpers for the unit tests only |
| `src/input/` | Key → action mapping, held keys |
| `src/i18n/` | All in-game texts |
| `src/render/` | Drawing on the canvas, scaling to the window, color palette |
| `src/highscores/` | High score list rules (who enters, order, names), unit-tested |
| `src/storage/` | Saving the list and the settings in localStorage, unit-tested with a fake storage |
| `src/screens/` | Start, pause, game over, name entry and high score screens (HTML over the canvas), the high score table and the pause menu |
| `src/main.ts` | Entry point: keyboard, screens, storage, game loop and drawing; loads `src/debug/` only on the development server |
| `src/debug/` | Test helpers, development server only |
| `e2e/` | Browser tests; `e2e/support/` reads the test interface and drives common steps (start a game, wait for a screen, play until game over) |
| `scripts/` | Release check and screenshots |
| `docs/spec/` | Requirements, milestones and test strategy (German), part of [SPEC.md](../SPEC.md) |
| `docs/images/` | Pictures for the README and spare stills, made by `npm run screenshots` |
| `.claude/` | Claude Code setup: stop hook, review agents, rules |
| `index.html` | The page that loads the game |
| `vite.config.ts`, `playwright.config.ts`, `playwright.screenshots.config.ts`, `eslint.config.js`, `tsconfig.json` | Tool configuration |

## Workflow

Work happens milestone by milestone: tests first, then a plan, the
implementation, reviews and acceptance. The steps are in
[Workflow per milestone](../CLAUDE.md#workflow-per-milestone), the rules for
tests, dependencies and naming in [Rules](../CLAUDE.md#rules), and when a
milestone counts as done in the Definition of Done (SPEC.md, section 10).

## Pitfalls

See [Pitfalls in CLAUDE.md](../CLAUDE.md#pitfalls). In addition:

- Opening `dist/index.html` directly as a file does not work, because browsers
  do not load JavaScript modules from `file://`. Use `npm run preview`.
- Port 5173 is fixed: if it is taken, `npm run serve` stops. Port 4173 is
  not: if it is taken, `npm run preview` picks another port and prints it.
