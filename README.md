# Purrfect Lines

A falling-block puzzle game for the browser. Pieces made of four blocks fall
into a 10 × 20 field; move and rotate them so they complete rows. Full rows
disappear. The game ends when the stack reaches the top.

This is an early version (milestone 2 of 8): it starts right away when the
page loads, has no points yet and no sound. The plan is in
[SPEC.md](SPEC.md), the numbered requirements (A1, A2, …) that code comments
refer to are in [docs/spec/anforderungen.md](docs/spec/anforderungen.md). Both
are in German.

## Requirements

- Windows (the setup is only tested there) and Node.js 26 LTS
  (`winget install OpenJS.NodeJS.LTS`)
- Free ports 5173 (dev server, also used by `npm run e2e`) and 4173 (`npm run preview`)
- For browser tests: Playwright's Chromium, installed once (and again after
  upgrading `@playwright/test`) with `npx playwright install chromium`

## Start

```bash
npm ci
```

```bash
npm run serve
```

Then open http://localhost:5173. The game starts immediately: a framed field
appears, and a piece falls from the top centre by about one row per second.
When the stack reaches the top, "Game over – press Enter" is shown over the
field.

To build the release version into `dist/`:

```bash
npm run build
```

To play the built version, serve `dist/` and open http://localhost:4173:

```bash
npm run preview
```

Opening `dist/index.html` directly as a file does not work, because browsers do
not load JavaScript modules from `file://`.

## Controls

| Key | Action |
|---|---|
| ← / → or A / D | Move left / right |
| ↓ or S (hold) | Soft drop: fall faster |
| ↑, W or X | Rotate clockwise |
| Q or Y | Rotate counter-clockwise |
| Space | Hard drop: fall to the bottom and lock at once |
| Enter | After game over: start a new game |

Letters work in upper and lower case and are recognised by the character they
type, so Y is the key labelled Y on any Latin keyboard layout (on a German
keyboard it sits where Z is on an English one).

Holding a move key moves the piece once, then after a short pause it keeps
sliding until you let go (A7). If both directions are held, the one pressed
last wins; letting it go hands over to the other one after the same short
pause. When the game window loses focus, all held keys count as released.

A piece that cannot turn in place (for example a vertical bar at the wall) is
shifted by the first of up to four other positions that makes room, as listed
in the wall kick tables of A9; if none fits, the piece does not turn.

A piece that lands does not lock at once: for half a second you can still
move or rotate it (A13). Each move or rotation while the piece rests (or that
lifts it off) restarts that time, but only 15 times per piece; the count
starts again when the piece reaches a lower row than before. After that the
piece locks as soon as it rests. Soft drop does not shorten that time; a hard
drop locks at once.

The timings (repeat delay and interval, lock delay, number of restarts) are in
[src/game/constants.ts](src/game/constants.ts).

## Test helpers (development server only)

These only work with `npm run serve`. The release build does not contain them.

| Helper | Effect |
|---|---|
| `?seed=<integer>`, e.g. http://localhost:5173/?seed=1 | Fixed piece sequence: the same seed always gives the same pieces, also for new games started with Enter. Invalid values are ignored and reported in the browser console. |
| `window.__purrfectLines` | Read-only game state for browser tests, a fresh copy on every read. Fields: `screen` (`"playing"` or `"gameOver"`), `board` (20 rows × 10 cells, piece letter or `null`), `active` (`{ type, cells }` with 0-based `x`/`y`, or `null`), `next`, `score`, `lines`, `level`. Try `window.__purrfectLines.screen` in the browser console. |

## Checks

| Command | What it does |
|---|---|
| `npm test` | Unit tests of the game logic (Vitest) |
| `npm run e2e` | Browser tests (Playwright, Chromium); starts the dev server itself |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type check |
| `npm run check` | Type check, lint and unit tests together |
| `npm run check:release` | Builds the game (overwrites `dist/`) and verifies that no test helper code is in it |

## Project layout

| Folder | Content |
|---|---|
| `src/game/` | Game rules without browser APIs, fully unit-tested |
| `src/input/` | Key → action mapping |
| `src/i18n/` | All in-game texts |
| `src/render/` | Drawing on the canvas, color palette |
| `src/debug/` | Test helpers, development server only |
| `e2e/` | Browser tests |
| `scripts/` | Release check |
