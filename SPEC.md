Status: fein (project-details, 2026-11-10)

# SPEC: Purrfect Lines

## Inhalt

Diese Datei enthält Projekt, Ziele, Entscheidungen und die Definition of Done.
Die Details stehen in Teilspecs:

| Teil | Datei |
|---|---|
| Anforderungen A1–A44 mit Randfällen und Prüfung | [docs/spec/anforderungen.md](docs/spec/anforderungen.md) |
| Teststrategie (fein), Testhilfen, Konstanten | [docs/spec/teststrategie.md](docs/spec/teststrategie.md) |
| Veröffentlichung: Lizenz, CI, GitHub Pages (A45–A55) | [docs/spec/veroeffentlichung.md](docs/spec/veroeffentlichung.md) |
| Meilensteine M1–M11 mit Abnahme-Checklisten | [docs/spec/meilensteine.md](docs/spec/meilensteine.md) |
| Definition of Done | Abschnitt 10 unten |

Die Spec wurde aufgeteilt, weil sie sonst über 600 Zeilen lang wäre. Eine
Session, die einen Meilenstein umsetzt, liest diese Datei, den Meilenstein und
die darin genannten Anforderungen.

## 1. Projekt

**Name:** Purrfect Lines (Arbeitstitel, passt zu den Marken „Web Coding Cat“
und „3D Printing Cat“). Eine grobe Websuche ergab kein Spiel mit genau diesem
Namen, nur die ähnlich benannte App „Purrfect Connect: Cat Lines“. Das ist keine
rechtliche Prüfung.

**Idee:** Purrfect Lines ist ein Fallblock-Puzzlespiel mit klassischer Mechanik
für den Browser. Formen aus vier Blöcken fallen in ein Spielfeld und lassen sich
verschieben und drehen. Volle Reihen lösen sich auf. Das Spiel wird mit der
Zeit schneller. Mechanisch gibt es keine eigenen Varianten.

**Abgrenzung zu bestehenden Spielen:** Nur die Spielmechanik des Genres wird
übernommen. Name, Farben, Grafikstil, Bildschirme, Musik und Klänge sind eigene.
Es gibt keine bekannten Melodien und keine nachgebildeten Originalfarben oder
Originalbildschirme. Auch im Code, in der Doku und in den Texten im Spiel kommt
der Markenname eines bestehenden Spiels nicht vor. Das Repo hieß bis M8
`tetris` und wird mit M9 in `purrfect-lines` umbenannt (A53), weil der alte
Name in der öffentlichen Adresse stünde.

## 2. Zweck

Das Projekt ist eine Übung, und zwar:
- im Umgang mit Claude Code: vom Interview über die Spec bis zur Umsetzung durch
  Claude,
- mit einem für mich neuen Stack (TypeScript mit moderner Web-Toolchain).

Zielgruppe bin ich selbst. Bis M8 wurde das Spiel nur lokal gespielt. Ab M11
ist es zusätzlich öffentlich unter `https://saijsaij.github.io/purrfect-lines/`
spielbar, damit ich es zeigen und teilen kann (siehe
[veroeffentlichung.md](docs/spec/veroeffentlichung.md)).

## 3. Ziele

- Ein technisch funktionierendes, spielbares Fallblock-Spiel im Browser.
- Der Code ist vollständig von Claude geschrieben („vibe-coded“). Ich steuere
  nur über Specs, Freigaben und Abnahmen. Daran messe ich den Erfolg.
- Ich lerne den Arbeitsablauf mit Claude Code kennen und sehe nebenbei, wie ein
  Projekt mit TypeScript und Vite funktioniert.

## 4. Feste Anforderungen

Vor dem Interview gab es keine. Im Interview festgelegt:
- Das Spiel läuft im Browser.
- Gesteuert wird mit der Tastatur.
- Es gibt Ton und Musik.
- Die Bestenliste wird lokal gespeichert und bleibt über Spielsitzungen erhalten.
- Name und Gestaltung sind eigene (siehe Abschnitt 1).

## 5. Nicht-Ziele

Diese Punkte sind bewusst ausgeschlossen. Sie kommen nur über eine Änderung
dieser Spec dazu:
- Mehrspieler, weder lokal noch online
- Online-Bestenliste, Benutzerkonten, Server oder Datenbank
- Veröffentlichung in Stores (App Store, Play Store, Steam usw.)
- weitere Spielmodi neben dem klassischen Endlosmodus (kein Zeit- oder
  Puzzlemodus)
- Touch-Steuerung und Bedienung auf dem Handy
- Gamepad-Steuerung

Bis M8 war auch „Hosting im Internet“ ein Nicht-Ziel. Am 2026-11-11 wurde es
aufgehoben: Das fertige Spiel soll sich ohne Installation zeigen lassen, und
der Build erzeugt ohnehin statische Dateien. Touch-Steuerung bleibt ein
Nicht-Ziel; Geräte ohne Maus bekommen nur einen Hinweis (A47).

## 6. Entscheidungen

### 6.1 Zielplattform und Auslieferung

**Entscheidung (geändert am 2026-11-11):** Das Spiel läuft im Browser.
Entwickelt und abgenommen wird lokal über den Entwicklungsserver oder die
gebauten statischen Dateien. Ab M11 liefert GitHub Pages den Build von main
zusätzlich öffentlich aus (A52).

**Bis M8 galt:** nur lokal, kein Hosting. Die Begründung unten gilt für die
Entwicklung weiter. Hosting kam dazu, weil das Spiel fertig ist und sich ohne
Installation zeigen lassen soll. Die Kosten waren wie erwartet *billig*.

**Begründung:**
- Claude kann ein Spiel im Browser im eingebauten Browser der Desktop-App
  selbst öffnen, bedienen und ansehen. Das ist für das Ziel „komplett
  vibe-coded“ der größte Vorteil: Claude findet Fehler, ohne dass ich sie
  beschreiben muss.
- Es muss nichts installiert werden. Grafik (Canvas), Ton (Web Audio) und
  Speicher (localStorage) bringt der Browser mit.
- Das Spiel lädt nach einer Änderung sofort neu.
- Ohne Hosting gibt es keine Secrets und keine Kosten.

**Verworfen:**
- *Desktop-Programm:* Es müsste pro Betriebssystem gebaut werden, und
  unsignierte `.exe`-Dateien lösen unter Windows SmartScreen-Warnungen aus. Vor
  allem könnte Claude das Spiel nur schwerfällig über die Bildschirmsteuerung
  prüfen.
- *Terminal:* Ton und flüssige Steuerung sind dort mühsam.
- *Hosting (Cloudflare Pages, Netlify, GitHub Pages):* bis M8 verworfen, weil
  es nicht gebraucht wurde. Seit 2026-11-11 gilt GitHub Pages, weil das Repo
  ohnehin auf GitHub liegt, öffentlich wird und dann nichts kostet. Ein
  weiteres Konto und ein Deploy-Token entfallen.

**Kosten einer späteren Änderung:**
- Hosting nachrüsten ist *billig*: Der Build erzeugt ohnehin statische Dateien.
- Ein Wechsel auf ein Desktop-Programm ist *mittel*: Electron oder Tauri ließen
  sich um den bestehenden Code legen, die Toolchain müsste aber erweitert werden.

### 6.2 Stack

**Entscheidung:**

| Baustein | Version (Stand Recherche 2026-11) | Zweck |
|---|---|---|
| TypeScript | 6.0.3 | Sprache (siehe Abschnitt 11, ursprünglich 7.x geplant) |
| Vite | 8.3.7 | Entwicklungsserver und Build |
| Canvas 2D (Browser) | – | Darstellung |
| Web Audio API (Browser) | – | Ton und Musik |
| localStorage (Browser) | – | Bestenliste |
| Node.js | 26 LTS | Laufzeit für die Werkzeuge, lokal installiert |

Alle Versionen sind exakt gepinnt, die vollständige Liste steht in Abschnitt 11.

**Begründung:**
- TypeScript baut auf meinem Vorwissen in JavaScript auf. Neu sind die Typen
  und die moderne Toolchain. Mit dieser Toolchain hat Claude am wenigsten
  Reibung, und die Feedbackschleife ist am schnellsten.
- **Nicht zu schwer:** Purrfect Lines besteht aus einem Spielfeld von 10×20
  Feldern, ein paar Tasten, Ton und einer Bestenliste. Dafür reicht direktes
  Zeichnen auf ein Canvas. Zur Laufzeit gibt es keine Bibliothek, Vite ist nur
  ein Entwicklungswerkzeug.
- Bewusst nicht verwendet werden eine Spiel-Engine (z. B. Phaser) und
  UI-Frameworks (z. B. React). Sie bringen Abstraktionen mit, die dieses Spiel
  nicht braucht. Die Menüs (Start, Pause, Spielende, Bestenliste) werden
  ebenfalls auf das Canvas gezeichnet oder als einfaches HTML umgesetzt.

**Verworfen:**
- *Rust + macroquad (WebAssembly):* Hier hätte ich am meisten Neues gelernt.
  Dafür sind die Toolchain größer und die Builds langsamer. Für den Schwerpunkt
  „Claude Code lernen“ bremst das mehr, als es bringt.
- *Go + Ebitengine (WebAssembly):* Die Wasm-Datei wird mehrere MB groß, die
  Entwicklungsschleife ist ähnlich langsam wie bei Rust.

**Kosten einer späteren Änderung:** Ein Sprachwechsel ist *hoch*, weil das
Spiel neu geschrieben werden müsste. Bei der Größe dieses Spiels bleibt das
aber überschaubar. Eine Bibliothek nachträglich hinzuzufügen ist *billig*.

### 6.3 Toolchain

**Entscheidung (beim Setup geändert):** Build, Tests und Entwicklungsserver
laufen lokal unter Windows mit Node.js 26 LTS (installiert per
`winget install OpenJS.NodeJS.LTS`). Alle Befehle sind npm-Skripte
(`npm test`, `npm run lint`, `npm run serve` usw.). Es gibt kein Wrapper-Skript.
Chromium für Playwright liegt im Benutzerprofil (`%LOCALAPPDATA%\ms-playwright`).
Eine `.npmrc` setzt `ignore-scripts=true`.

**Begründung:** Ursprünglich war Docker mit dem Bash-Wrapper `./dev` und
`node_modules` auf dem Host entschieden. Beim Setup lief das so, aber ESLint
brauchte über den Windows-Bind-Mount **25 Sekunden statt 2** (gemessen), weil
typescript-eslint sehr viele kleine Dateien lädt. Der Stop-Hook hätte damit etwa
34 Sekunden pro Rundenende gebraucht. Lokal braucht die gesamte Prüfung
(Typecheck, Linter, Unit-Tests) etwa 5 Sekunden, und Vite erkennt Änderungen ohne
Polling sofort.

**Bewusst in Kauf genommen:**
- Node.js liegt global auf dem Host.
- Die Umgebung ist nicht mehr exakt reproduzierbar. Bei einem
  Ein-Personen-Projekt spielt das kaum eine Rolle.
- Pakete könnten beim Installieren Code auf dem Host ausführen. Das verhindert
  `ignore-scripts=true`. Braucht ein künftiges Paket ein Install-Skript, wird
  das bewusst entschieden.

**Verworfen:**
- *Docker mit `node_modules` auf dem Host:* siehe oben, zu langsam.
- *Docker mit `node_modules` in einem Docker-Volume:* Das wäre schnell, aber der
  Editor auf dem Host fände die Typen nicht.
- *Docker, Linter nicht im Stop-Hook:* Der Linter würde dann bei jedem
  Rundenende fehlen.
- *Claude Code selbst im Container:* Das geht nur mit der CLI, nicht mit dem
  Code-Tab der Desktop-App. Damit fiele auch der eingebaute Browser weg, mit
  dem Claude das Spiel prüfen soll.

**Kosten einer späteren Änderung:** Ein Wechsel zurück zu Docker ist *billig*.
Dockerfile, `compose.yaml` und `./dev` stehen in Commit `4adf5b4` und lassen sich
von dort wiederherstellen. Den Code betrifft das nicht.

### 6.4 Tests (grob)

**Entscheidung:**
- **Automatisch mit Vitest:** Die Spiellogik bekommt Unit-Tests: Bewegen,
  Drehen, Kollisionen, das Auflösen von Reihen, Punkte, Level und
  Geschwindigkeit, Spielende sowie das Lesen und Schreiben der Bestenliste. Die
  Spiellogik wird dafür von Darstellung, Ton und Eingabe getrennt, damit sie
  ohne Browser testbar ist.
- **Automatisch mit Playwright:** Ein paar Browser-Tests decken die
  Grundabläufe ab: Das Spiel startet, reagiert auf Tasten, ein Spiel endet, und
  die Bestenliste bleibt nach einem Neuladen erhalten. Die Tests laufen lokal
  in Chromium.
- **Typprüfung:** Der TypeScript-Compiler prüft die Typen als eigener Schritt.
- **Manuell** nehme ich ab, wie sich das Spiel spielt, wie es aussieht und ob
  der Ton passt.

**Begründung:** Die Logik ist der fehleranfälligste Teil, lässt sich aber am
leichtesten testen. Browser-Tests sichern das Zusammenspiel ab, bleiben aber
wenige, weil sie langsamer und anfälliger sind.

**Verworfen:** *nur Vitest.* Das wäre eine Abhängigkeit weniger, aber das
Zusammenspiel im Browser bliebe ungeprüft.

**Kosten einer späteren Änderung:** *billig.*

### 6.5 Secrets

Es gibt keine (siehe Abschnitt 8).

### 6.6 Git und CI

**Entscheidung (geändert am 2026-11-11):** Das Repo liegt auf GitHub unter
`SaijSaij/purrfect-lines` (bis M8 privat als `SaijSaij/tetris`) und wird ab M11
öffentlich. Ab M9 prüft GitHub Actions jeden Push auf main und jeden Pull
Request mit `npm run check`, `npm run e2e` und `npm run check:release` (A49).
Tests laufen weiterhin lokal, und der Stop-Hook erzwingt sie bei jedem
Rundenende von Claude.

**Begründung:** Bis M8 galt: Ich arbeite allein, Claude führt die Tests ohnehin
aus, eine CI brächte kaum Nutzen. Mit dem öffentlichen Repo ändert sich das:
Der Deploy auf Pages soll nur geprüften Code ausliefern, und Pull Requests von
anderen sollen automatisch geprüft werden. Für öffentliche Repos ist GitHub
Actions kostenlos.

**Verworfen:** *Keine CI* (bis M8 die Entscheidung).

**Kosten einer späteren Änderung:** *billig.* Ein Workflow, der dieselben
npm-Skripte aufruft, besteht aus einer Datei.

### 6.7 Öffentlichkeit und Lizenz

**Entscheidung (geändert am 2026-11-11):** Das Repo wird öffentlich und steht
unter GPL-3.0-or-later (A45). Das Spiel verlinkt seinen Quellcode (A46). Die
Git-Historie bleibt vollständig erhalten, mit der bisherigen Autoren-Adresse.

**Begründung:** Bis M8 war das Repo privat und ohne Lizenz („alle Rechte
vorbehalten“), weil das Projekt eine private Übung war. Jetzt soll es sich
zeigen lassen. Die GPL sorgt dafür, dass veränderte Fassungen offen bleiben.
Alle Assets sind eigene: Grafik und Ton entstehen im Code (A35, A32), es gibt
keine fremden Dateien. Ein Umschreiben der Historie würde die Commit-Hashes in
meilensteine.md ungültig machen.

**Verworfen:** *MIT* (erlaubt auch geschlossene Weiterverwendung), *keine
Lizenz* (dann dürfte niemand den Code nutzen), *Historie umschreiben oder neu
beginnen* (siehe oben).

**Kosten einer späteren Änderung:** Die Lizenz zu wechseln ist *mittel*: Für
bereits veröffentlichte Stände gilt die GPL weiter. Das Repo wieder privat zu
stellen ist technisch *billig*, aber Kopien und Forks bleiben bestehen.

## 7. Offene Annahmen

| Annahme | Vorläufiger Standard |
|---|---|
| Herkunft von Ton und Musik | Klänge und Musik werden zur Laufzeit per Web Audio synthetisiert. Es gibt keine Audiodateien und damit keine Lizenzfragen. Die Musik ist eine eigene Komposition. |
| Grafik | Sie wird im Code gezeichnet, ohne Bilddateien, mit einer eigenen, warmen Farbpalette und dezentem Katzenbezug (A35). |
| Musikstil | Ruhige, verspielte Schleife von etwa 30 Sekunden, die beim Spielen nicht ermüdet. Wird in M6 nach Gehör abgenommen. |
| Konkrete Farben | Werden in M7 festgelegt. Bis dahin reicht eine schlichte, gut unterscheidbare Palette. |
| Zahlenwerte für das Spielgefühl | Die Startwerte der Konstanten (teststrategie.md) sind Schätzungen und werden bei den Abnahmen nachjustiert. |
| Standardname | EN „Kitty“, DE „Katze“, wenn das Namensfeld leer bleibt (A27). |
| Unterstützte Browser | Aktuelle Desktop-Versionen von Chromium-Browsern und Firefox. Getestet wird automatisch mit Chromium. |

Die offenen Annahmen zur Veröffentlichung (Impressum, Node-Version, Dauer der
CI) stehen in [veroeffentlichung.md](docs/spec/veroeffentlichung.md#offene-annahmen).
Die frühere Annahme „Repo-Name“ ist mit A53 entschieden.

## 8. Secrets

Es gibt **keine**: keinen Server, keine Konten und keine eigenen
Deploy-Tokens. Der Deploy auf GitHub Pages (A52) nutzt das Token, das GitHub
für jeden Actions-Lauf selbst bereitstellt. Es muss nirgends hinterlegt
werden. Die Bestenliste im localStorage enthält keine geheimen Daten.

Die `.env`-Regeln aus den Projektgrundlagen bleiben als Vorsorge bestehen.
Kommt später doch ein Secret hinzu (z. B. ein Deploy-Token für ein Hosting),
muss dieser Abschnitt ergänzt und `.gitignore` geprüft werden.

## 9. Teststrategie (grob)

- Unit-Tests der Spiellogik mit Vitest, die Logik ist dafür von Darstellung,
  Ton und Eingabe getrennt
- wenige Browser-Tests mit Playwright für Start, Steuerung, Spielende und
  Bestenliste
- Typprüfung mit dem TypeScript-Compiler
- alles lokal über npm-Skripte. Typecheck, Linter und Unit-Tests erzwingt ein
  Stop-Hook (`npm run check`), Playwright läuft separat (`npm run e2e`).
- ab M9 zusätzlich GitHub Actions bei jedem Push auf main und jedem Pull
  Request, mit denselben npm-Skripten (A49)
- Darüber hinaus prüft Claude Änderungen am Spiel im eingebauten Browser der
  Desktop-App.
- Spielgefühl, Aussehen und Ton nehme ich manuell ab.

Die Einzelheiten stehen in
[docs/spec/teststrategie.md](docs/spec/teststrategie.md).

## 10. Definition of Done

Ein Meilenstein ist fertig, wenn alles davon zutrifft:

1. Die Tests zu seinen Anforderungen wurden vor der Umsetzung geschrieben und
   sind zuerst fehlgeschlagen.
2. `npm run check` (Typecheck, Linter, Unit-Tests) ist grün.
3. `npm run e2e` ist grün.
4. `npm run check:release` ist grün (ab M1, siehe A44).
5. Der `code-reviewer` hat die geänderten Dateien geprüft, und es gibt keine
   offenen MUSS-Punkte.
6. README und docs/DEVELOPMENT.md beschreiben Start, Steuerung und
   Testhilfen auf dem neuen Stand.
7. Wurde Doku geändert (README, docs/, SPEC.md, CLAUDE.md), hat der
   `docs-reviewer` sie mit der Liste der geänderten Dateien geprüft, und seine
   Punkte sind erledigt oder bewusst verworfen.
8. Ich habe den Meilenstein mit seiner Checkliste abgenommen.
9. Alles ist in einem Commit (oder wenigen zusammengehörigen) festgehalten.

Jeder gefundene Fehler wird zuerst ein Test, dann die Korrektur.

**Begründung:** Tests zuerst, damit sie wirklich die Spec prüfen und nicht
den Code nachzeichnen. README und `docs-reviewer` halten die Doku mit dem Code
gleich, weil ich das Projekt nur über Specs und Doku steuere.

## 11. Aufgesetzter Stack

Aufgesetzt am 2026-11-10 mit `setup-stack`. **Das Grundgerüst ist damit
erledigt** (es ist kein Meilenstein in der Liste). Stand nach dem Setup: Es gab
ein leeres, lauffähiges Projekt mit je einem Beispieltest für Vitest und
Playwright, aber noch keinen Spielcode. Der Spielcode entsteht ab M1.

**Tatsächlich verwendete Versionen** (alle exakt gepinnt, nur devDependencies,
zur Laufzeit keine Bibliothek):

| Paket | Version |
|---|---|
| Node.js (lokal, winget) | 26.13.0 |
| typescript | 6.0.3 |
| vite | 8.3.7 |
| vitest | 5.1.0 |
| @playwright/test | 1.65.0 (Chromium 1254) |
| eslint | 10.14.0 |
| @eslint/js | 10.0.1 |
| typescript-eslint | 8.72.2 |

**Abweichungen von der groben Spec:**
- **TypeScript 6.0.3 statt 7:** typescript-eslint 8.72.2 verlangt
  `typescript <6.1.0` und unterstützt TypeScript 7 (den neuen Compiler in Go)
  noch nicht. Für ein Projekt dieser Größe bringt TypeScript 7 keinen spürbaren
  Vorteil. Die Version wird angehoben, sobald typescript-eslint sie unterstützt.
- **Linter ergänzt:** ESLint mit typescript-eslint (typgeprüft,
  `recommendedTypeChecked`). Die grobe Spec nannte keinen Linter. Es gelten
  diese Komplexitätsregeln als Fehler: `max-depth` 3,
  `max-lines-per-function` 50 (in Tests aus), `complexity` 10, `max-params` 4.
- **Toolchain lokal statt Docker:** siehe 6.3.
- **Playwright-Smoke-Test schon im Grundgerüst:** Er belegt früh, dass der
  Browser-Teil der Toolchain funktioniert.
- **Bekannte Audit-Meldung:** `npm audit` meldet eine moderate
  Denial-of-Service-Lücke in `minimatch` innerhalb der Abhängigkeiten von
  ESLint. Sie betrifft nur Glob-Muster beim Linten und wird akzeptiert. Der
  angebotene Fix wäre ein Rückschritt auf ESLint 9.

**Absicherung für Claude:**
- Ein Stop-Hook (`.claude/hooks/stop-check.sh`, Git Bash, Zeitlimit 120 s)
  führt `npm run check` aus, wenn es nicht committete Änderungen gibt. Schlägt
  die Prüfung fehl, blockiert er das Rundenende. Solange die Datei
  `.claude/.tests-first` existiert (Tests vor der Umsetzung), prüft er nur
  Typecheck und Linter. Fehlschlagende Unit-Tests sind dann erlaubt.
- Vor `npm install`, `npm i` und `npm add` fragt Claude nach (ask-Regeln in
  `.claude/settings.json`). `npx` und `cd` sind gesperrt (deny-Regeln).
  `git status`, `git diff`, `git log`, `git add` und `git commit` laufen ohne
  Nachfrage, `git push` und `git merge` nur nach Nachfrage.
