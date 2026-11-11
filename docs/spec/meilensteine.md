# Meilensteine

Teil der [SPEC.md](../../SPEC.md). Das Grundgerüst (Toolchain, Tests, Linter,
CLAUDE.md, Hooks) ist mit `setup-stack` erledigt und kein Meilenstein mehr.
Jeder Meilenstein ist erst fertig, wenn die Definition of Done (SPEC.md,
Abschnitt 10) erfüllt ist. Anforderungen: [anforderungen.md](anforderungen.md).

**Warum diese Reihenfolge:** Eine technische Voraussetzung, die erst bewiesen
werden müsste, gibt es nicht. Canvas, Tastatur, Web Audio und localStorage sind
erprobt, und der Smoke-Test des Grundgerüsts läuft. M1 ist das kleinste
Ergebnis, das schon Spaß macht. M2 und M3 verbessern das Spielgefühl am
stärksten. M4 bis M8 hängen kaum voneinander ab und kommen nach Nutzen.
M9 bis M11 bringen das fertige Spiel online (siehe
[veroeffentlichung.md](veroeffentlichung.md)). Die CI kommt zuerst, damit sie
schon prüft, wenn das Repo öffentlich wird. Die Lizenz muss auf main liegen,
bevor das Repo öffentlich wird, und Pages braucht ein öffentliches Repo.

**Vorgehen pro Meilenstein:** siehe
[CLAUDE.md, Workflow per milestone](../../CLAUDE.md#workflow-per-milestone).

---

## M1 – Spielbare Grundversion

**Status:** erledigt am 2026-11-10 (Commit b896005)

**Ziel:** Man kann im Browser ein einfaches, vollständiges Spiel spielen, das
irgendwann endet.

**Anforderungen:** A1, A2, A3, A4, A5, A6 (ohne Wiederholung), A8 (nur im
Uhrzeigersinn mit ↑ und X, ohne Kicks), A10 (fest Level 1), A11 (ohne Punkte),
A12 (ohne Punkte), A15, A21 (nur Pfeiltasten, X, Leertaste), A37 (nur
Englisch), A39, A43, A44.

**Übergangsverhalten (wird in späteren Meilensteinen ersetzt):**
- Das Spiel startet sofort beim Laden.
- Eine Form rastet beim nächsten Fallschritt ein, sobald sie aufliegt (keine
  Gnadenfrist).
- Volle Reihen verschwinden sofort.
- Beim Spielende steht „Game over – press Enter“ über dem Feld. Enter startet
  ein neues Spiel.
- Schlichte Darstellung: Feld mit Rahmen und farbigen Blöcken, noch ohne
  Seitenleiste.

**Abschlusskriterium:** Unit-Tests für A1–A6, A8, A10, A15 und die
Formfolge grün. E2E-Tests 2 (ohne Punkte) und 4 grün. `npm run check:release`
existiert und ist grün.

**Abnahme-Checkliste:**
- [x] `npm run serve` öffnen: Eine Form erscheint oben mittig und fällt etwa
      eine Reihe pro Sekunde.
- [x] ← und → schieben, an der Wand geht es nicht weiter.
- [x] ↑ dreht, ↓ beschleunigt, Leertaste lässt sofort fallen.
- [x] Eine volle Reihe verschwindet, darüber rutscht alles nach.
- [x] Stapeln bis oben beendet das Spiel, Enter startet neu.
- [x] `?seed=1` zweimal laden: gleiche Formfolge.
- [x] Gebaute Version (`npm run build`, dann `npm run preview` und
      http://localhost:4173 öffnen): `?seed` hat keine Wirkung.

## M2 – Steuerung mit gutem Gefühl

**Status:** erledigt am 2026-11-11 (Commit b1ed5f2)

**Ziel:** Die Steuerung fühlt sich flüssig und fair an.

**Anforderungen:** A6 und A7 (Wiederholung), A8 (beide Richtungen), A9, A13,
A21 (alle Spieltasten inklusive WASD, Q, Y).

**Abschlusskriterium:** Unit-Tests für A7, A8, A9 und A13 grün, inklusive
gesteuerter Zeit.

**Abnahme-Checkliste:**
- [x] ← gedrückt halten: kurze Pause, dann gleichmäßig schnelles Gleiten bis
      zur Wand.
- [x] Beide Richtungen gleichzeitig: Die zuletzt gedrückte gewinnt.
- [x] Senkrechter Stab direkt an der Wand lässt sich drehen.
- [x] Q und Y drehen gegen den Uhrzeigersinn, W und X im Uhrzeigersinn.
- [x] Aufliegende Form lässt sich noch kurz schieben, rastet aber nicht
      endlos spät ein.
- [x] WASD funktioniert genauso wie die Pfeile.

## M3 – Punkte, Level, Tempo, Hilfen

**Status:** erledigt am 2026-11-11 (Commit da5f239)

**Ziel:** Das Spiel zählt Punkte, wird schneller und zeigt Vorschau und
Geisterstein.

**Anforderungen:** A10 (volle Kurve), A11 und A12 (mit Punkten), A14, A17,
A18, A19, A20, A40, A41, A42.

**Übergangsverhalten:** Seitenleiste mit Punkten, Reihen, Level und Vorschau
in schlichter Gestaltung.

**Abschlusskriterium:** Unit-Tests für A10, A11, A12, A14, A17, A18, A19,
A40, A41 grün. E2E-Test 2 prüft jetzt auch die Punkte.

**Abnahme-Checkliste:**
- [x] Vorschau zeigt die Form, die tatsächlich als nächste kommt.
- [x] Geisterstein zeigt die Landeposition und wandert mit.
- [x] Vier Reihen auf einmal geben deutlich mehr Punkte als vier einzelne.
- [x] Nach 10 Reihen steigt das Level, die Formen fallen spürbar schneller.
- [x] `?level=15` ist schnell, aber noch spielbar.
- [x] `?slow=4` läuft deutlich langsamer, `?debug` zeigt die Werte.

## M4 – Bildschirme und Ablauf

**Status:** erledigt am 2026-11-11 (Commit 2a443d6)

**Ziel:** Das Spiel hat Start, Pause und Ende wie ein fertiges Spiel und passt
sich dem Fenster an.

**Anforderungen:** A16, A22 (Bestenliste noch leer bzw. ohne Liste), A23,
A24, A25, A26 (ohne Namenseingabe: Enter führt zum Start), A31.

**Abschlusskriterium:** Unit-Tests für A16 und A23 grün. E2E-Tests 1, 3, 4,
5 und 9 grün.

**Abnahme-Checkliste:**
- [x] Beim Laden erscheint der Startbildschirm, Enter startet.
- [x] P und Esc pausieren, das Feld ist verdeckt, Fortsetzen geht nahtlos
      weiter.
- [x] Alt+Tab in ein anderes Fenster pausiert.
- [x] Aufgeben führt zum Spielende-Bildschirm mit den Werten.
- [x] Volle Reihen leuchten kurz auf, bevor sie verschwinden.
- [x] Fenster verkleinern und vergrößern: Spiel bleibt ganz sichtbar und
      scharf.

## M5 – Bestenliste

**Status:** erledigt am 2026-11-11 (Commit c18c884)

**Ziel:** Gute Partien werden mit Namen gespeichert und bleiben erhalten.

**Anforderungen:** A22 (mit Bestenliste), A26 (mit Namenseingabe), A27, A28,
A29, A30.

**Abschlusskriterium:** Unit-Tests für A27, A29 und A30 grün. E2E-Test 6
grün.

**Abnahme-Checkliste:**
- [x] Erste Partie: Namensfeld ist leer; leerer Name wird zu „Kitty“.
- [x] Zweite Partie: letzter Name ist vorausgefüllt.
- [x] Mehr als 12 Zeichen lassen sich nicht eingeben.
- [x] Esc in der Namenseingabe speichert nichts.
- [x] Der neue Eintrag ist in der Liste hervorgehoben.
- [x] Nach dem Neuladen ist die Liste noch da.
- [x] Mit gesperrten Website-Daten für localhost läuft das Spiel, mit
      Hinweis zum Speichern.

## M6 – Ton und Musik

**Status:** erledigt am 2026-11-11 (Commit 56bbdb9)

**Ziel:** Das Spiel hat eigene Klänge und eigene Musik, die man abschalten
kann.

**Anforderungen:** A32, A33, A34.

**Abschlusskriterium:** Unit-Tests für A32 (Ereignisse), A33 (Tempo) und A34
grün. E2E-Test 7 grün.

**Abnahme-Checkliste:**
- [x] Auf dem Startbildschirm ist es still; Enter startet das Spiel, und die
      Musik setzt ein.
- [x] Drehen, Einrasten, harter Fall und Reihen klingen unterschiedlich.
- [x] Schieben ist still. Spielende (nur Leertaste drücken, bis der Stapel
      oben ist) und Aufgeben klingen absteigend. ↑/↓ im Pausemenü klicken
      leise.
- [x] Nach 10 Reihen (normal spielen) erklingt beim Level-Aufstieg eine
      kurze Tonfolge.
- [x] Vier Reihen auf einmal klingen nach Katze: http://localhost:5173/?seed=8&slow=4
      laden, Enter, dann je Form diese Tasten kurz antippen:
      L: → → → Leertaste · I: ← Leertaste · Z: ↑ ← ← ← Leertaste ·
      T: Leertaste · J: ↑ ← ← ← ← Leertaste · S: → → → Leertaste ·
      O: ← ← ← ← Leertaste · Z: → Leertaste · S: ↑ ← ← Leertaste ·
      J: → → → Leertaste · I: ↑ → → → → Leertaste. Die letzte Form löst
      vier Reihen auf einmal auf.
- [x] Nacheinander `?level=1` und `?level=15` laden: Bei Level 15 läuft die
      Musik deutlich schneller (+40 %).
- [x] In der Pause ist die Musik sofort still, auch nach einem Wechsel in
      einen anderen Tab, und läuft nach dem Fortsetzen weiter.
- [x] M und N schalten getrennt stumm, die Seitenleiste zeigt den Zustand,
      und er bleibt nach dem Neuladen.
- [x] Die Melodie erinnert an kein bekanntes Stück.

## M7 – Gestaltung

**Status:** erledigt am 2026-11-11 (Commit aac6118)

**Ziel:** Das Spiel sieht nach Purrfect Lines aus: warm, eigen, mit dezentem
Katzenbezug.

**Anforderungen:** A35, A36.

**Abschlusskriterium:** Palette steht an einer Stelle im Code. Eine Suche im
Repo findet keinen fremden Markennamen.

**Abnahme-Checkliste:**
- [x] Die sieben Formen sind auf einen Blick unterscheidbar.
- [x] Die Farben wirken warm und stimmig. Der Stab ist nicht hellblau, und
      keine Form hat die im Genre übliche Farbe.
- [x] Pfotenabdrücke sind erkennbar, aber nicht unruhig.
- [x] Der Katzenkopf im Titel gefällt mir.
- [x] Geisterstein ist klar von echten Blöcken zu unterscheiden.
- [x] Texte sind auf allen Bildschirmen gut lesbar. Geprüft in einem kleinen
      Fenster (etwa halbe Bildschirmhöhe): Startbildschirm mit voller Liste
      (10 Einträge), Startbildschirm mit Speicherhinweis (Website-Daten
      gesperrt), Spielfeld mit Seitenleiste, Pause, Spielende, Namenseingabe,
      Bestenliste.

## M8 – Deutsch

**Status:** erledigt am 2026-11-11 (Commit 31027fd)

**Ziel:** Das Spiel spricht Deutsch und Englisch.

**Anforderungen:** A37 (beide Sprachen), A38.

**Abschlusskriterium:** Unit-Test „jeder Schlüssel in jeder Sprache“ und für
die Startsprache grün. E2E-Test 8 grün.

**Abnahme-Checkliste:**
- [x] Gespeicherte Daten löschen (`localStorage.clear()` in der Konsole) und
      neu laden: Bei deutscher Browsersprache startet das Spiel auf Deutsch.
      In einem Browser oder Profil mit englischer Sprache, ebenfalls ohne
      gespeicherte Daten, startet es auf Englisch.
- [x] L auf dem Startbildschirm wechselt die Sprache, sie bleibt nach dem
      Neuladen.
- [x] Alle Bildschirme sind vollständig übersetzt, nichts ist abgeschnitten.
      Geprüft in einem kleinen Fenster (etwa halbe Bildschirmhöhe):
      Startbildschirm mit voller Liste (10 Einträge), Startbildschirm mit
      Speicherhinweis (Website-Daten gesperrt), Spielfeld mit Seitenleiste,
      Pause, Spielende, Namenseingabe, Bestenliste.
- [x] Auf Deutsch eine Partie mit leerem Namen speichern: Der Eintrag heißt
      „Katze“, das Datum steht im Format TT.MM.JJJJ. Ältere Einträge behalten
      ihren Namen.

## M9 – Umbenennen und CI

**Status:** erledigt am 2026-11-11 (Commit e7768c0)

**Ziel:** Das Repo heißt `purrfect-lines`, und jeder Push auf main und jeder
Pull Request wird automatisch geprüft.

**Anforderungen:** A49, A50, A51, A53 (nur Umbenennen und Remote), A54 (nur
der CI-Teil von `docs/DEVELOPMENT.md`).

**Übergangsverhalten:** Das Repo ist noch privat. Die CI läuft mit den
kostenlosen Minuten für private Repos.

**Abschlusskriterium:** Die CI ist im Pull Request des Meilenstein-Branches
grün. Claude fragt vor dem Push des Branches und vor dem Öffnen des Pull
Requests.

**Abnahme-Checkliste:**
- [x] `gh repo view` ausführen: zeigt `SaijSaij/purrfect-lines`.
- [x] `git remote -v` ausführen: zeigt die neue URL.
- [x] `https://github.com/SaijSaij/tetris` im Browser öffnen: leitet auf das
      neue Repo um.
- [x] Im Pull Request den Reiter „Checks“ öffnen: Der Lauf zeigt die Schritte
      check, e2e und check:release, alle grün.

## M10 – Lizenz, Quellcode-Link, Tastatur-Hinweis

**Status:** offen

**Ziel:** Das Projekt ist bereit, öffentlich zu werden.

**Anforderungen:** A45, A46, A47, A55, A54 (README: Lizenz und Hinweis auf
die Tastatur).

**Übergangsverhalten:** Das Repo ist noch privat. Für andere führt der
Quellcode-Link auf eine 404-Seite.

**Abschlusskriterium:** Der Unit-Test der Texttabelle ist mit den neuen
Schlüsseln grün. E2E-Tests für A46 und A47 grün. Die CI im Pull Request ist
grün.

**Abnahme-Checkliste** (Start: `npm run serve`, http://localhost:5173):
- [ ] Fenster groß und klein ziehen: Unter dem Spiel steht dezent
      „Purrfect Lines · Source code · GPL-3.0“, das Spiel bleibt ganz sichtbar,
      es gibt keine Bildlaufleisten.
- [ ] L auf dem Startbildschirm: Die Zeile zeigt „Quellcode“.
- [ ] Im Spiel „Source code“ anklicken: Ein neuer Tab zeigt das Repo, das
      Spiel ist pausiert.
- [ ] Zum Spiel-Tab zurückkehren und Enter drücken: Das Spiel läuft weiter, es
      öffnet sich kein weiterer Tab.
- [ ] In der Namenseingabe den Link anklicken, zurückkehren und tippen: Die
      Zeichen erscheinen im Namensfeld.
- [ ] Auf dem Startbildschirm Tab, dann Enter drücken: Das Spiel startet, der
      Link wird nicht geöffnet.
- [ ] DevTools-Gerätemodus (ein Handy wählen, Hochformat) und neu laden:
      Anstelle von „Enter startet“ steht „This game is played with a physical
      keyboard – best opened on a computer.“ Gerätemodus aus und neu laden:
      Wieder „Enter startet“.
- [ ] Gerätemodus Hochformat, volle Bestenliste (10 Einträge), Website-Daten
      gesperrt, auf Englisch und auf Deutsch: Der Hinweis ist vollständig
      lesbar, nichts ist abgeschnitten oder überlagert.
- [ ] Browser-Tab: zeigt den Katzenkopf als Symbol.
- [ ] Auf der Repo-Seite bei GitHub (Pull Request bzw. Branch): Rechts steht
      die Lizenz „GPL-3.0“.

## M11 – Online auf GitHub Pages

**Status:** offen

**Ziel:** Das Spiel ist unter `https://saijsaij.github.io/purrfect-lines/`
spielbar und wird nach jedem grünen Push auf main aktualisiert.

**Voraussetzung:** M10 ist auf main gepusht.

**Anforderungen:** A48, A52, A53 (öffentlich, Beschreibung, Website,
Pages-Quelle), A54 (Link zum Online-Spiel, CI-Badge, Deploy-Teil von
`docs/DEVELOPMENT.md`).

**Übergangsverhalten:** keines.

**Abschlusskriterium:** `npm run check:release` mit der Pfadprüfung aus A48 ist
grün. Die CI im Pull Request ist grün. Nach Merge und Push sind der Deploy und
die Live-Seite in Ordnung (Stufe 2).

**Abnahme in zwei Stufen:** Stufe 1 vor dem Merge, Stufe 2 nach Merge und
Push. Der Status-Commit folgt erst nach Stufe 2. Ein Fehler in Stufe 2 wird auf
einem neuen Branch korrigiert.

**Abnahme-Checkliste, Stufe 1** (vor dem Merge):
- [ ] `gh repo view` ausführen: Das Repo ist öffentlich, mit Beschreibung und
      Website.
- [ ] `https://github.com/SaijSaij/purrfect-lines` in einem privaten Fenster
      (nicht angemeldet) öffnen: Das Repo ist sichtbar, rechts steht
      „GPL-3.0“.
- [ ] Im Pull Request: Die CI ist grün, der Deploy-Job wurde übersprungen.
- [ ] `npm run build`, dann `npm run preview` und http://localhost:4173
      öffnen: Das Spiel ist spielbar.

**Abnahme-Checkliste, Stufe 2** (nach Merge und Push):
- [ ] Im Reiter „Actions“ der Lauf auf main: grün, inklusive Deploy.
- [ ] `https://saijsaij.github.io/purrfect-lines/` in einem privaten Fenster
      öffnen: Startbildschirm erscheint, Enter startet, Ton und Musik laufen.
- [ ] Live eine Partie mit Eintrag in der Bestenliste beenden und neu laden:
      Der Eintrag ist noch da.
- [ ] Live `?seed=1` und `?debug` anhängen: keine Wirkung.
- [ ] Live-URL auf dem echten Handy öffnen, im Hoch- und Querformat: Der
      Tastatur-Hinweis ist ohne Zoomen lesbar, und der Quellcode-Link lässt
      sich antippen.
- [ ] Live auf den Quellcode-Link klicken: Das öffentliche Repo öffnet sich.
- [ ] README auf GitHub: Der Link zum Spiel funktioniert, das CI-Badge ist
      grün.
