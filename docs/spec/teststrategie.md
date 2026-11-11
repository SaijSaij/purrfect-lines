# Teststrategie (fein)

Teil der [SPEC.md](../../SPEC.md). Ergänzt die grobe Teststrategie in
Abschnitt 9 der SPEC.md. Die Anforderungen stehen in
[anforderungen.md](anforderungen.md).

## Grundsatz

Die Spiellogik ist ein reiner TypeScript-Teil ohne DOM, Canvas, Audio und Uhr.
Sie bekommt Eingaben (Aktionen wie „links“, „drehen“) und die vergangene Zeit
von außen und liefert einen Zustand und Ereignisse (z. B. „Reihen aufgelöst“,
„eingerastet“) zurück. Darstellung, Ton, Tastatur und Speicher hängen außen
dran. Deshalb lässt sich fast alles mit Vitest prüfen, und nur das
Zusammenspiel braucht Playwright.

## Zufall und Zeit kontrollierbar

- **Zufall:** Die Formfolge kommt aus einem eigenen, kleinen Zufallsgenerator
  mit Seed (wenige Zeilen, keine Bibliothek). Tests geben den Seed vor. Im
  Browser setzt `?seed` ihn (A39), sonst wird er zufällig gewählt.
- **Zeit:** Die Logik liest nie selbst die Uhr. Sie bekommt pro Schritt die
  vergangenen Millisekunden (`update(deltaMs)`). Tests spielen die Zeit damit
  gezielt vor, z. B. „499 ms, dann 1 ms“. Die Zeitlupe (A41) teilt nur dieses
  `deltaMs`.
- **Speicher:** Der Zugriff auf localStorage läuft über eine kleine
  Schnittstelle. Tests geben eine Attrappe hinein, die Daten liefert oder
  Fehler wirft.
- **Tastatur:** Die Zuordnung Taste → Aktion ist eine reine Funktion und wird
  ohne Browser getestet. Tastenwiederholung (A7) liegt in der Logik und läuft
  mit gesteuerter Zeit.

## Automatisch geprüft

**Vitest (Unit):** A1–A19, A21, A23 (Zeit steht), A27 (Namensregeln), A29,
A30, A32 (Ereignisse), A33 (Tempo), A34, A37, A38 (Startsprache), A40, A41.
Die Zeile „Prüfung“ in jeder Anforderung sagt, was der Test festlegt.

**Playwright (E2E, Chromium, gegen den Entwicklungsserver):** Die Tests nutzen
`?seed` und die Testschnittstelle (A43). Geplante Tests:
1. Startbildschirm erscheint, Enter startet, eine Form fällt (A22).
2. Pfeiltaste verschiebt die Form, Leertaste lässt sie landen, Punkte steigen
   (A12, A20, A21).
3. P pausiert und verdeckt das Feld, P setzt fort; Fokusverlust pausiert
   (A23, A24).
4. Mit festem Seed und nur hartem Fall endet ein Spiel, der
   Spielende-Bildschirm zeigt die Werte (A5, A26).
5. Aufgeben aus der Pause führt zum Spielende (A25).
6. Name eingeben, Eintrag erscheint, bleibt nach Neuladen (A27, A28, A30).
7. M schaltet Musik, Zustand bleibt nach Neuladen (A34).
8. L wechselt die Sprache, bleibt nach Neuladen (A38).
9. Zwei Fenstergrößen ohne Bildlaufleisten (A31).
10. Quellcode-Link: Ziel, neuer Tab, nicht per Tab erreichbar, Text wechselt
    mit L; nach einem Klick öffnet Enter keinen zweiten Tab (A46).
11. Mit Touch-Emulation steht der Tastatur-Hinweis anstelle von „Enter
    startet“, ohne Emulation nicht (A47).

Jeder Test kommt mit dem Meilenstein, der die Anforderung liefert.

**Release-Prüfung:** `npm run check:release` baut das Spiel und prüft, dass
der Debug-Code im Bundle fehlt (A44) und `dist/index.html` keine absoluten
Pfade enthält (A48).

**CI (ab M9):** GitHub Actions führt bei jedem Push auf main und bei jedem Pull
Request `npm run check`, `npm run e2e` und `npm run check:release` aus (A49).
In der CI wird ein fehlgeschlagener Browser-Test einmal wiederholt, lokal nie
(A51). Die CI ersetzt die lokalen Prüfungen nicht, sie sichert main und
fremde Pull Requests zusätzlich ab.

**Bereits vorhanden:** Typecheck, ESLint mit Komplexitätsregeln und der
Stop-Hook (`npm run check`).

## Manuell abgenommen

Spielgefühl (Geschwindigkeiten, Gnadenfrist, Tastenwiederholung), Aussehen
(Palette, Pfoten, Katzenkopf, Lesbarkeit, Schärfe), Ton und Musik, die
Animation beim Auflösen. Jeder Meilenstein hat dafür eine Checkliste in
[meilensteine.md](meilensteine.md).

## Testhilfen

Nur im Entwicklungsbuild (`npm run serve`), siehe A39–A44:

| Parameter | Wirkung |
|---|---|
| `?seed=42` | feste Formfolge |
| `?level=12` | Startlevel |
| `?slow=4` | alles viermal langsamer |
| `?debug` | Textanzeige mit internen Werten |
| `window.__purrfectLines` | lesender Zustand für Playwright |

## Konstanten

Diese Werte werden später nach Gefühl nachjustiert. Sie stehen gesammelt in
einer Datei (z. B. `src/game/constants.ts`) und nirgends sonst als Zahl im
Code. Tests beziehen sich auf die Konstanten, nicht auf die Zahlen.

| Konstante | Startwert | Anforderung |
|---|---|---|
| `GRAVITY_MS` | Tabelle 1000 … 50 ms | A10 |
| `SOFT_DROP_FACTOR` | 20 | A11 |
| `SOFT_DROP_POINTS` | 1 | A11 |
| `HARD_DROP_POINTS` | 2 | A12 |
| `LOCK_DELAY_MS` | 500 | A13 |
| `LOCK_RESETS_MAX` | 15 | A13 |
| `REPEAT_DELAY_MS` | 170 | A7 |
| `REPEAT_INTERVAL_MS` | 50 | A7 |
| `LINE_CLEAR_MS` | 300 | A16 |
| `LINE_POINTS` | 100 / 300 / 500 / 800 | A17 |
| `LINES_PER_LEVEL` | 10 | A18 |
| `NAME_MAX_LENGTH` | 12 | A27 |
| `HIGHSCORE_SIZE` | 10 | A28 |
| `MUSIC_TEMPO_STEP` | 3 % pro Level | A33 |
| `MUSIC_TEMPO_MAX` | +40 % | A33 |

Die Farbpalette (A35) und die Lautstärken stehen ebenfalls jeweils an einer
Stelle.
