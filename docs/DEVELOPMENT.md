# Developing Purrfect Lines

How to work on the game: setup, checks, test helpers and where things are.
How to play is in the [README](../README.md). The plan, the numbered
requirements (A1, A2, …) that code comments refer to and the milestones are in
[SPEC.md](../SPEC.md) and [docs/spec/](spec/) (in German).

Rules, commands and the workflow that Claude Code follows are in
[CLAUDE.md](../CLAUDE.md). This page links there instead of repeating them.

## Prerequisites

- Windows (the setup is only tested there; the CI runs on Ubuntu) and
  Node.js 26 LTS in exactly the version written in `.node-version`, e.g.
  `winget install OpenJS.NodeJS.LTS --version <version from .node-version>`.
  Without `--version`, winget installs the newest LTS release, which may differ
  from the CI's. The other versions are listed under
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

Sound works the same way: the game rules report what happened (rotation, lock,
hard drop, cleared rows with their count, new level, game over) through
`takeEvents()`, and `src/main.ts` passes these events to `src/audio/` once per
frame. Unit tests check the events and the pure rules in
`src/audio/sound-rules.ts` (music tempo, switching); how the sounds and the
music sound is checked by ear. The browser tests for sound
(`e2e/sound.spec.ts`) only check that M and N change the saved settings, not
the audio output. To listen, press any key first (browsers allow sound only
after a key press). `?slow` slows down the game and with it the sound events,
but not the music: its tempo depends only on the level.

Language works the same way: `startLanguage(saved, browserLanguage)` in
`src/i18n/language.ts` gets `navigator.language` passed in and is
unit-tested, like the date format and the completeness of the text tables
(`src/i18n/*.test.ts`). The browser tests in `e2e/language.spec.ts` set the
browser language with Playwright's `locale` option and read the page language
from `<html lang>`.

The keyboard hint for phones and tablets depends on the media query
`(any-pointer: fine)`. The browser tests in `e2e/publishing.spec.ts` emulate a
touch device with Playwright's `hasTouch` and `isMobile` options; by hand,
use the device mode of the browser's developer tools and reload, because the
query is read when the screens are built. The same file checks the source
code line; a click on its link opens a tab that the test answers with an
empty page, so no network is needed.

Checklist items with a long key sequence (e.g. clearing four rows at once with
a fixed seed) can be replayed and checked by a script instead of by hand. With
`npm run serve` running, the browser console of the game's tab can load the
game rules with `await import('/src/game/game.ts')`, create a game with
`createGame({ seed })` and call `press` and `release` for each key; `state`
then shows board, lines and score. In the script no time passes between the
keys; when you then play the sequence by hand, add `?slow` so the pieces
hardly fall while you type.

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

The high score list and the settings are in the browser's localStorage under
`purrfect-lines.highscores` and `purrfect-lines.settings`, as JSON. The
settings hold `lastName` (the name entered last, text), `music` and `sounds`
(true or false), and `language` (`"en"` or `"de"`) once a language was chosen
with L; without it the game follows the browser language. Every origin has
its own storage, so the development server (port 5173) and `npm run preview`
(port 4173) keep separate lists. To start over, delete both keys in the
browser's developer tools (Application → Local storage) or run
`localStorage.clear()` in the console of the game's tab, which empties the
storage of that origin. Browser tests start with an empty storage in every
test.

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
are in `scripts/screenshots.spec.ts`. The browser language is fixed to
English (`locale` in `playwright.screenshots.config.ts`), so the pictures
match the README. They use `?seed=1` and, where a piece
falls, `?slow=10`, so the still pictures come out the same on every run. The
animation runs at normal speed and its timing varies a little; the run fails
if its row is not cleared. Its frames go to `test-results/screenshots/`
(git-ignored), where `scripts/make-apng.js` joins them using only Node itself,
so that script only works after the screenshot tests. The README uses the
animation and three of the stills; `gameplay.png` and `line-clear.png` are
spare. The command is not part of `npm run check`; run it when the look of the
game changes.

## Continuous integration

GitHub Actions runs [.github/workflows/ci.yml](../.github/workflows/ci.yml) on
every push to main and on every pull request. On Ubuntu, with the Node.js
version from `.node-version`, it installs the dependencies (`npm ci`) and
Playwright's Chromium, then runs `npm run check`, `npm run e2e` and
`npm run check:release`, the automatic checks of the Definition of Done. Any
red step makes the whole run red. The CI adds to the local checks, it does not
replace them.

Only in the CI (where the environment variable `CI` is set) a failed browser
test is retried once; locally it never is (`playwright.config.ts`). A test
that passes on the retry leaves the run green and produces no report; the log
of the `e2e` step marks it as "flaky". Look for that word now and then, so
unstable tests do not go unnoticed. In the CI a `test.only` left in `e2e/`
makes the run red.

**A red run:** open the pull request's "Checks" tab, or the "Actions" tab of
the repository, and click the run; the log of the red step shows the error. If
a browser test failed for good, the run has an artifact `playwright-report`
(kept for 7 days) at the bottom of the run's summary page. Download and unpack
it, then open its `index.html` in a browser: it lists the failed tests with a
screenshot each.

**Updating the actions:** every action in `ci.yml` (all `uses:` lines:
checkout, setup-node, upload-artifact) is pinned to a full commit SHA with its
version as a comment (`uses: actions/checkout@<sha> # v7.0.1`), and is only
updated on request. To move an action to a newer version, look up the SHA of
its tag with the GitHub CLI (`gh`, signed in with `gh auth login`), e.g.

```bash
gh api repos/actions/checkout/commits/v7.0.1 --jq .sha
```

and replace both the SHA and the version comment. New pins cannot be tested
locally: push the change on a branch and check that the CI of its pull request
is green.

**Updating Node.js:** the exact version is only in `.node-version`, as a bare
version number such as `26.13.0` (no `v`). `actions/setup-node` installs
exactly this version in the CI, so it must be a released Node.js version.
Change it together with the local installation (see
[Versions in CLAUDE.md](../CLAUDE.md#versions)), then run all checks locally.

## Tuning

The timings (fall intervals per level, repeat delay and interval, lock delay
and its restarts, line clear animation), the points, the maximum name length,
the size of the high score list and the music tempo steps are in
[src/game/constants.ts](../src/game/constants.ts). Tests refer to these
names, never to the numbers. All colors are in
[src/render/palette.ts](../src/render/palette.ts). The unit test
`src/render/palette.test.ts` fails if a color literal (`#…`, `rgb(…)`,
`hsl(…)`) appears outside palette.ts (in `src/` or `index.html`), if two
pieces share a color, if a piece's hue is within 40° of its usual hue in the
genre (the table `GENRE_HUES` in the test), or if a source file refers to an
image file. The paw print and the cat head are drawn in
[src/render/decor.ts](../src/render/decor.ts). The cat head is also the
favicon: a small plugin in [vite.config.ts](../vite.config.ts) turns it into
an SVG data URI in `index.html`, on the development server and in the build,
so `index.html` itself holds no colors. Because the Vite config loads
`decor.ts`, that file and the files it imports (`palette.ts`,
`src/game/pieces.ts`) are imported with a `.ts` extension; without it, Vite
warns on every run. `tsconfig.json` allows these extensions
(`allowImportingTsExtensions`); the rest of the code imports without them. All visible texts are in
[src/i18n/texts.ts](../src/i18n/texts.ts), one table per language with the
same keys; a unit test fails if a key is missing or empty in a language.
`text(key)` returns the text in the current language. The canvas reads it
anew every frame, the HTML screens are rebuilt when L switches the language,
and the source code line under the game gets its texts anew.
The date format per language is in
[src/i18n/format.ts](../src/i18n/format.ts). The volumes of the mix (master,
music, sounds) and of each kind of sound are at the top of
[src/audio/audio.ts](../src/audio/audio.ts); melody and bass volume, the
tempo (`BPM`) and the notes of the music are at the top of
[src/audio/music.ts](../src/audio/music.ts).

## Project structure

| Path | Content |
|---|---|
| `src/game/` | Game rules without browser APIs, unit-tested; `testing.ts` holds helpers for the unit tests only |
| `src/input/` | Key → action mapping, held keys |
| `src/i18n/` | All in-game texts in English and German, choosing the start language, date format |
| `src/render/` | Drawing on the canvas, scaling to the window (`fit.ts`, which keeps room above and below the game area for the source code line), color palette; `decor.ts` holds the paw print (canvas) and the cat head (SVG element for the start screen) |
| `src/highscores/` | High score list rules (who enters, order, names), unit-tested |
| `src/storage/` | Saving the list and the settings in localStorage, unit-tested with a fake storage |
| `src/screens/` | Start, pause, game over, name entry and high score screens (HTML over the canvas; the start screen's title carries the cat head), the high score table, the pause menu and the line under the game with the source code link (`source-line.ts`, which also holds the repository address) |
| `src/audio/` | Sound with the Web Audio API (browser only): `audio.ts` (sounds, switching, volumes), `music.ts` (music loop), `synth.ts` (tone helper); `sound-rules.ts` holds the unit-tested rules (music tempo, switching) |
| `src/main.ts` | Entry point: keyboard, screens, storage, sound, game loop and drawing; loads `src/debug/` only on the development server |
| `src/debug/` | Test helpers, development server only |
| `e2e/` | Browser tests; `e2e/support/` reads the test interface and drives common steps (start a game, wait for a screen, play until game over) |
| `scripts/` | Release check and screenshots |
| `docs/spec/` | Requirements, milestones and test strategy (German), part of [SPEC.md](../SPEC.md) |
| `docs/images/` | Pictures for the README and spare stills, made by `npm run screenshots` |
| `.claude/` | Claude Code setup: stop hook, review agents, rules |
| `.github/workflows/` | CI workflow (`ci.yml`) |
| `.node-version` | Exact Node.js version: the one to install locally, read by the CI |
| `index.html` | The page that loads the game, with the description for shared links |
| `LICENSE` | GPL-3.0 license text, fetched unchanged with `gh api licenses/gpl-3.0` |
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
