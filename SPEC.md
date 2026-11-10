Status: grob (project-scope, 2026-11-10)

# SPEC: Purrfect Lines

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
der Markenname eines bestehenden Spiels nicht vor. Der Repo-Name `tetris` ist
historisch, siehe offene Annahmen.

## 2. Zweck

Das Projekt ist eine Übung, und zwar:
- im Umgang mit Claude Code: vom Interview über die Spec bis zur Umsetzung durch
  Claude,
- mit einem für mich neuen Stack (TypeScript mit moderner Web-Toolchain und
  Docker als Entwicklungsumgebung).

Zielgruppe bin ich selbst. Das Spiel wird lokal gespielt.

## 3. Ziele

- Ein technisch funktionierendes, spielbares Fallblock-Spiel im Browser.
- Der Code ist vollständig von Claude geschrieben („vibe-coded“). Ich steuere
  nur über Specs, Freigaben und Abnahmen. Daran messe ich den Erfolg.
- Ich lerne den Arbeitsablauf mit Claude Code kennen und sehe nebenbei, wie ein
  Projekt mit TypeScript, Vite und Docker funktioniert.

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
- Hosting im Internet (siehe Entscheidung 6.1)

## 6. Entscheidungen

### 6.1 Zielplattform und Auslieferung

**Entscheidung:** Das Spiel läuft im Browser und wird nur lokal gespielt. Man
startet es über den Entwicklungsserver oder über die gebauten statischen
Dateien. Es gibt kein Hosting.

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
- *Hosting (Cloudflare Pages, Netlify, GitHub Pages):* Es wird derzeit nicht
  gebraucht. GitHub Pages ginge bei einem privaten Repo nur mit bezahltem Konto.

**Kosten einer späteren Änderung:**
- Hosting nachrüsten ist *billig*: Der Build erzeugt ohnehin statische Dateien.
- Ein Wechsel auf ein Desktop-Programm ist *mittel*: Electron oder Tauri ließen
  sich um den bestehenden Code legen, die Toolchain müsste aber erweitert werden.

### 6.2 Stack

**Entscheidung:**

| Baustein | Version (Stand Recherche 2026-11) | Zweck |
|---|---|---|
| TypeScript | 7.x | Sprache |
| Vite | 8.x | Entwicklungsserver und Build |
| Canvas 2D (Browser) | – | Darstellung |
| Web Audio API (Browser) | – | Ton und Musik |
| localStorage (Browser) | – | Bestenliste |
| Node.js | 26 LTS | Laufzeit für die Werkzeuge, nur im Container |

Die exakten Versionen legt das Setup fest und hält sie in der Lockfile fest.

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

**Entscheidung:** Build, Tests und Entwicklungsserver laufen in Docker. Claude
und ich rufen alles über ein Bash-Wrapper-Skript `./dev` auf (z. B.
`./dev serve`, `./dev test`, `./dev build`). Auf dem Host ist Docker die einzige
Voraussetzung, Node.js wird nicht installiert.

Details:
- Das Projekt bleibt unter `C:\dev\…` und wird per Bind-Mount in den Container
  eingehängt.
- Weil Änderungen über die Grenze zwischen Windows und Container nicht
  zuverlässig gemeldet werden, nutzt Vite Polling, um Dateiänderungen zu
  erkennen.
- `node_modules` liegt auf dem Host, damit ein Editor die Typen findet.
  Installiert und ausgeführt wird es nur im Container. Es enthält deshalb
  Linux-Programme, und `npm` lässt sich nicht direkt unter Windows aufrufen.
- Der Port des Entwicklungsservers wird auf `localhost` freigegeben, damit der
  Browser der Desktop-App und mein eigener Browser das Spiel erreichen.
- `./dev` ist ein Bash-Skript. Es läuft in Git Bash, die auch Claude nutzt. Ein
  PowerShell-Pendant gibt es nicht.

**Begründung:** Auf dem Host bleibt nichts installiert, und die
Entwicklungsumgebung lässt sich exakt wiederholen. Den Umgang mit Docker als
Entwicklungsumgebung zu üben gehört zum Lernziel.

**Bewusst in Kauf genommen:**
- Polling kostet etwas CPU. Das Neuladen dauert etwa eine halbe bis eine
  Sekunde statt sofort.
- Jeder Befehl startet erst einen Container.
- Installieren und Testen werden langsamer, weil `node_modules` über die
  Containergrenze gelesen wird.

**Verworfen:**
- *Lokal unter Windows installiert:* Das wäre am schnellsten, aber Node.js läge
  dauerhaft auf dem Host, und Install-Skripte von Paketen liefen dort.
- *Claude Code selbst im Container:* Das geht nur mit der CLI, nicht mit dem
  Code-Tab der Desktop-App. Damit fiele auch der eingebaute Browser weg, mit
  dem Claude das Spiel prüfen soll.
- *Projekt im WSL-Dateisystem:* Das Neuladen wäre schneller, aber die
  Desktop-App, Git und der Editor müssten über `\\wsl$` zugreifen.
- *`node_modules` in einem Docker-Volume:* Das wäre schneller, aber der Editor
  auf dem Host fände die Typen nicht.

**Kosten einer späteren Änderung:** Ein Wechsel auf eine lokale Toolchain ist
*billig*: Node.js wird installiert, und `./dev` ruft dann `npm` direkt auf. Den
Code betrifft das nicht.

### 6.4 Tests (grob)

**Entscheidung:**
- **Automatisch mit Vitest:** Die Spiellogik bekommt Unit-Tests: Bewegen,
  Drehen, Kollisionen, das Auflösen von Reihen, Punkte, Level und
  Geschwindigkeit, Spielende sowie das Lesen und Schreiben der Bestenliste. Die
  Spiellogik wird dafür von Darstellung, Ton und Eingabe getrennt, damit sie
  ohne Browser testbar ist.
- **Automatisch mit Playwright:** Ein paar Browser-Tests decken die
  Grundabläufe ab: Das Spiel startet, reagiert auf Tasten, ein Spiel endet, und
  die Bestenliste bleibt nach einem Neuladen erhalten. Die Tests laufen im
  Container, auf Basis des offiziellen Playwright-Images mit vorinstallierten
  Browsern.
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

**Entscheidung:** Das Repo liegt privat auf GitHub unter `SaijSaij/tetris`. Es
gibt keine CI. Tests laufen lokal über `./dev`.

**Begründung:** Ich arbeite allein, und Claude führt die Tests bei jeder
Änderung ohnehin aus. Eine CI wäre ein zusätzlicher Baustein ohne
nennenswerten Nutzen.

**Verworfen:** *GitHub Actions* (kostenlos für private Repos, bis 2000 Minuten
im Monat).

**Kosten einer späteren Änderung:** *billig.* Ein Workflow, der dieselben
`./dev`-Befehle aufruft, besteht aus einer Datei.

### 6.7 Öffentlichkeit und Lizenz

**Entscheidung:** Das Repo ist privat, und es gibt keine Lizenzdatei. Damit
gilt „alle Rechte vorbehalten“.

**Begründung:** Das Projekt ist eine private Übung.

**Kosten einer späteren Änderung:** *billig.* Wird das Repo veröffentlicht,
wird eine Lizenz gewählt und ergänzt. Vorher ist zu prüfen, dass alle Assets
eigene sind (siehe Abschnitt 1).

## 7. Offene Annahmen

| Annahme | Vorläufiger Standard |
|---|---|
| Exakte Versionen | Beim Setup die aktuellen stabilen Versionen der Hauptversionen aus 6.2 wählen und prüfen. TypeScript 7 ist der neue Compiler in Go. Funktioniert er mit Vite oder Vitest nicht, wird auf TypeScript 6 ausgewichen. |
| Herkunft von Ton und Musik | Klänge und Musik werden zur Laufzeit per Web Audio synthetisiert. Es gibt keine Audiodateien und damit keine Lizenzfragen. Die Musik ist eine eigene Komposition. |
| Grafik | Sie wird im Code gezeichnet, ohne Bilddateien, mit einer eigenen Farbpalette, gern mit Katzenbezug. |
| Spielfeldgröße und Regeln | 10×20 Felder und sieben Formen aus je vier Blöcken. Rotationssystem, Punktevergabe, Vorschau und das Halten einer Form klärt das feine Interview. |
| Repo-Name | Der Name `tetris` bleibt vorerst. Eine Umbenennung (z. B. in `purrfect-lines`) ist jederzeit möglich, GitHub leitet dann um. |
| Polling-Intervall von Vite | Der Standardwert gilt, bis das Neuladen spürbar stört. |
| Docker auf dem Host | Docker Desktop mit WSL-2-Backend, wie bereits installiert. |
| Unterstützte Browser | Aktuelle Desktop-Versionen von Chromium-Browsern und Firefox. Getestet wird automatisch mit Chromium. |

## 8. Secrets

Es gibt **keine**: keinen Server, keine Konten, kein Hosting und keine
Deploy-Tokens. Die Bestenliste im localStorage enthält keine geheimen Daten.

Die `.env`-Regeln aus den Projektgrundlagen bleiben als Vorsorge bestehen.
Kommt später doch ein Secret hinzu (z. B. ein Deploy-Token für ein Hosting),
muss dieser Abschnitt ergänzt und `.gitignore` geprüft werden.

## 9. Teststrategie (grob)

- Unit-Tests der Spiellogik mit Vitest, die Logik ist dafür von Darstellung,
  Ton und Eingabe getrennt
- wenige Browser-Tests mit Playwright für Start, Steuerung, Spielende und
  Bestenliste
- Typprüfung mit dem TypeScript-Compiler
- alles über `./dev` im Container
- Darüber hinaus prüft Claude Änderungen am Spiel im eingebauten Browser der
  Desktop-App.
- Spielgefühl, Aussehen und Ton nehme ich manuell ab.

Einzelheiten (welche Fälle, Testdaten, Abdeckung) klärt das feine Interview.

## 10. Noch offen für das feine Interview

- Spielregeln im Detail: Rotationssystem, Zufall bei der Auswahl der Formen,
  Punktevergabe, Levelkurve, Vorschau auf die nächste Form, Halten einer Form,
  harter und weicher Fall
- Tastenbelegung und Pause
- Bildschirme: Start, Pause, Spielende, Bestenliste (wie viele Einträge, mit
  Namen?)
- Gestaltung: Farbpalette, Katzenbezug, Musik und Klänge
- Meilensteine mit Abschlusskriterien
- Definition of Done
