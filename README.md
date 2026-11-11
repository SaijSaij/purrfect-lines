# Purrfect Lines

A cosy falling-block puzzle for the browser, with a cat's touch.

![Pieces fall, slide into place and complete the bottom row, which lights up and disappears](docs/images/gameplay.apng.png)

[Play](#play) · [High scores](#high-scores) · [Sound](#sound) · [Controls](#controls) · [Scoring and levels](#scoring-and-levels) · [Development](docs/DEVELOPMENT.md)

## What it is

Pieces made of four blocks fall into a field of 10 × 20 cells. Move and rotate
them so they complete rows: full rows light up and disappear. The game gets
faster as you clear rows, and it ends when the stack reaches the top.

This is an early version (milestone 6 of 8). It has start, pause and game over
screens, a high score list, sounds and music, but no German texts yet.

| Start | Pause | Game over |
|---|---|---|
| ![Start screen with title, keys and the empty high score list](docs/images/start-screen.png) | ![Pause menu with Resume and Give up](docs/images/pause.png) | ![Game over screen with score, lines and level](docs/images/game-over.png) |

## Play

You need Windows (the setup is only tested there), Node.js 26 LTS
(`winget install OpenJS.NodeJS.LTS`, then check in a new terminal with
`node --version`), a keyboard and a current desktop browser based on Chromium
or Firefox. Clone the repository, and in the project folder install once:

```bash
npm ci
```

Then start the game:

```bash
npm run serve
```

The server keeps running in the terminal until you stop it with Ctrl+C. If
port 5173 is already taken, it stops with an error; free the port first.

Open http://localhost:5173. The start screen shows the title, the keys and the
high score list; press Enter to start. A piece falls from the top centre by
about one row per second, and a pale outline (the ghost piece) shows where it
will land. The sidebar shows the next piece, the score, the cleared rows
(lines) and the level. When the stack reaches the top, the game over screen
shows your score, lines and level. Press Enter: if the score makes it into the
high score list, you enter your name next, otherwise you are back on the start
screen.

## High scores

The list keeps the 10 best games with name, score, lines, level and date. A
game enters it if it scored more than 0 points and the list has fewer than 10
entries or the score beats the last one; on equal scores the older entry stays
ahead.

- **Name entry:** type up to 12 characters; all keys, including Space and the
  game keys, are just text here. Enter saves and shows the list with your new
  entry highlighted, and Enter again leads to the start screen. Esc skips the
  entry, saves nothing and leads to the start screen. Spaces at the start and
  end are removed, and an empty name is saved as "Kitty". Next time the field
  holds what you typed last (empty if you left it empty).
- **Saving:** the list, your last name and the sound settings are stored in
  the browser (localStorage) for http://localhost:5173 and survive a reload. The release
  version on port 4173 keeps its own list. If the browser does not allow
  saving (for example when site data is blocked), the game still runs, the
  list lasts only until the page is reloaded, and the start screen says so.
  Invalid stored entries are dropped; if nothing can be read, the list starts
  empty.

The game area fills the browser window as far as its fixed shape allows. It
adapts at once when you resize the window and stays sharp on scaled displays
(e.g. 125 % or 150 %).

To play the release version instead, build it and serve it, then open
http://localhost:4173:

```bash
npm run build
```

```bash
npm run preview
```

## Sound

The game has its own sounds for rotating, locking, a hard drop, cleared rows
(four at once sound like a cat), a new level, the end of a game and choosing
in menus. Moving is silent. While you play, a music loop of about 30 seconds
runs; it gets 3 % faster with every level, at most 40 % faster (from level 15
on). The music is silent on all other screens and in the pause, and after a
pause it continues where it stopped. Everything is made by the browser while
the game runs; there are no audio files.

- **M** switches the music, **N** the sounds on and off, on every screen
  except the name entry. The bottom of the sidebar shows both, and the setting
  is saved like the high score list. Both are on at the first start.
- Browsers allow sound only after a key press, so the start screen is silent;
  the music starts with the first game.

## Controls

| Key | Action |
|---|---|
| ← / → or A / D | Move left / right |
| ↓ or S (hold) | Soft drop: fall 20 times faster |
| ↑, W or X | Rotate clockwise |
| Q or Y | Rotate counter-clockwise |
| Space | Hard drop: fall to the bottom and lock at once |
| P or Esc | Pause / continue |
| ↑ / ↓ or W / S | Choose in the pause menu |
| Enter | Start screen: start a game. Pause menu: confirm. Game over: on to the name entry or the start screen. Name entry: save. High score list: back to the start screen |
| Esc | Name entry: skip without saving |
| M / N | Music / sounds on and off (not in the name entry) |

Letters work in upper and lower case and are recognised by the character they
type, so Y is the key labelled Y on any Latin keyboard layout (on a German
keyboard it sits where Z is on an English one).

- **Pause:** the field is hidden and time stands still. The menu offers
  "Resume" and "Give up"; giving up ends the game like a regular game over.
  Continuing picks up exactly where the game stopped. When the window loses
  focus or the tab is hidden, a running game pauses by itself and stays
  paused when you come back.
- **Holding a move key** moves the piece once, then after a short pause it
  keeps sliding until you let go. If both directions are held, the one pressed
  last wins.
- **Turning at a wall:** a piece that cannot turn in place (for example a
  vertical bar at the wall) tries a few shifted positions in a fixed order
  (sideways, sometimes up or down); if none fits, it does not turn.
- **Landing:** a piece that lands does not lock at once. For half a second you
  can still move or rotate it, and each move restarts that time, up to 15
  times per piece. A hard drop locks at once.
- **Clearing rows:** full rows light up briefly before they disappear. During
  that time only pausing works.

## Scoring and levels

| Event | Points |
|---|---|
| 1 / 2 / 3 / 4 rows cleared at once | 100 / 300 / 500 / 800 × level |
| Soft drop | 1 per row fallen while ↓ or S is held |
| Hard drop | 2 per row skipped |

Row points use the level before the clear, even if that clear raises the
level. Drop points are not multiplied by the level; rows a piece falls on its
own give nothing.

The game starts on level 1. Every 10 cleared rows the level rises by one, and
pieces fall faster: from one row per second on level 1 down to one row every
50 ms from level 15 on. The level keeps rising after that, the speed does not.

## License

No license yet: all rights reserved.

## Development

How to run the tests, use the test helpers and find your way around the code
is in [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md). The plan and the numbered
requirements (A1, A2, …) are in [SPEC.md](SPEC.md) and
[docs/spec/](docs/spec/) (in German).
