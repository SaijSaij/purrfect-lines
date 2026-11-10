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

**Status:** offen

**Ziel:** Die Steuerung fühlt sich flüssig und fair an.

**Anforderungen:** A6 und A7 (Wiederholung), A8 (beide Richtungen), A9, A13,
A21 (alle Spieltasten inklusive WASD, Q, Y).

**Abschlusskriterium:** Unit-Tests für A7, A8, A9 und A13 grün, inklusive
gesteuerter Zeit.

**Abnahme-Checkliste:**
- [ ] ← gedrückt halten: kurze Pause, dann gleichmäßig schnelles Gleiten bis
      zur Wand.
- [ ] Beide Richtungen gleichzeitig: Die zuletzt gedrückte gewinnt.
- [ ] Senkrechter Stab direkt an der Wand lässt sich drehen.
- [ ] Q und Y drehen gegen den Uhrzeigersinn, W und X im Uhrzeigersinn.
- [ ] Aufliegende Form lässt sich noch kurz schieben, rastet aber nicht
      endlos spät ein.
- [ ] WASD funktioniert genauso wie die Pfeile.

## M3 – Punkte, Level, Tempo, Hilfen

**Status:** offen

**Ziel:** Das Spiel zählt Punkte, wird schneller und zeigt Vorschau und
Geisterstein.

**Anforderungen:** A10 (volle Kurve), A11 und A12 (mit Punkten), A14, A17,
A18, A19, A20, A40, A41, A42.

**Übergangsverhalten:** Seitenleiste mit Punkten, Reihen, Level und Vorschau
in schlichter Gestaltung.

**Abschlusskriterium:** Unit-Tests für A10, A11, A12, A14, A17, A18, A19,
A40, A41 grün. E2E-Test 2 prüft jetzt auch die Punkte.

**Abnahme-Checkliste:**
- [ ] Vorschau zeigt die Form, die tatsächlich als nächste kommt.
- [ ] Geisterstein zeigt die Landeposition und wandert mit.
- [ ] Vier Reihen auf einmal geben deutlich mehr Punkte als vier einzelne.
- [ ] Nach 10 Reihen steigt das Level, die Formen fallen spürbar schneller.
- [ ] `?level=15` ist schnell, aber noch spielbar.
- [ ] `?slow=4` läuft deutlich langsamer, `?debug` zeigt die Werte.

## M4 – Bildschirme und Ablauf

**Status:** offen

**Ziel:** Das Spiel hat Start, Pause und Ende wie ein fertiges Spiel und passt
sich dem Fenster an.

**Anforderungen:** A16, A22 (Bestenliste noch leer bzw. ohne Liste), A23,
A24, A25, A26 (ohne Namenseingabe: Enter führt zum Start), A31.

**Abschlusskriterium:** Unit-Tests für A16 und A23 grün. E2E-Tests 1, 3, 4,
5 und 9 grün.

**Abnahme-Checkliste:**
- [ ] Beim Laden erscheint der Startbildschirm, Enter startet.
- [ ] P und Esc pausieren, das Feld ist verdeckt, Fortsetzen geht nahtlos
      weiter.
- [ ] Alt+Tab in ein anderes Fenster pausiert.
- [ ] Aufgeben führt zum Spielende-Bildschirm mit den Werten.
- [ ] Volle Reihen leuchten kurz auf, bevor sie verschwinden.
- [ ] Fenster verkleinern und vergrößern: Spiel bleibt ganz sichtbar und
      scharf.

## M5 – Bestenliste

**Status:** offen

**Ziel:** Gute Partien werden mit Namen gespeichert und bleiben erhalten.

**Anforderungen:** A22 (mit Bestenliste), A26 (mit Namenseingabe), A27, A28,
A29, A30.

**Abschlusskriterium:** Unit-Tests für A27, A29 und A30 grün. E2E-Test 6
grün.

**Abnahme-Checkliste:**
- [ ] Erste Partie: Namensfeld ist leer; leerer Name wird zu „Kitty“.
- [ ] Zweite Partie: letzter Name ist vorausgefüllt.
- [ ] Mehr als 12 Zeichen lassen sich nicht eingeben.
- [ ] Esc in der Namenseingabe speichert nichts.
- [ ] Der neue Eintrag ist in der Liste hervorgehoben.
- [ ] Nach dem Neuladen ist die Liste noch da.
- [ ] Im privaten Fenster läuft das Spiel, mit Hinweis zum Speichern.

## M6 – Ton und Musik

**Status:** offen

**Ziel:** Das Spiel hat eigene Klänge und eigene Musik, die man abschalten
kann.

**Anforderungen:** A32, A33, A34.

**Abschlusskriterium:** Unit-Tests für A32 (Ereignisse), A33 (Tempo) und A34
grün. E2E-Test 7 grün.

**Abnahme-Checkliste:**
- [ ] Nach dem ersten Tastendruck läuft Musik.
- [ ] Drehen, Einrasten, harter Fall und Reihen klingen unterschiedlich.
- [ ] Vier Reihen auf einmal klingen nach Katze.
- [ ] Musik wird mit dem Level etwas schneller.
- [ ] In der Pause ist die Musik still und läuft danach weiter.
- [ ] M und N schalten getrennt, der Zustand bleibt nach dem Neuladen.
- [ ] Die Melodie erinnert an kein bekanntes Stück.

## M7 – Gestaltung

**Status:** offen

**Ziel:** Das Spiel sieht nach Purrfect Lines aus: warm, eigen, mit dezentem
Katzenbezug.

**Anforderungen:** A35, A36.

**Abschlusskriterium:** Palette steht an einer Stelle im Code. Eine Suche im
Repo findet keinen fremden Markennamen.

**Abnahme-Checkliste:**
- [ ] Die sieben Formen sind auf einen Blick unterscheidbar.
- [ ] Die Farben wirken warm und stimmig, nicht wie das Genre-Original.
- [ ] Pfotenabdrücke sind erkennbar, aber nicht unruhig.
- [ ] Der Katzenkopf im Titel gefällt mir.
- [ ] Geisterstein ist klar von echten Blöcken zu unterscheiden.
- [ ] Texte sind auf allen Bildschirmen gut lesbar.

## M8 – Deutsch

**Status:** offen

**Ziel:** Das Spiel spricht Deutsch und Englisch.

**Anforderungen:** A37 (beide Sprachen), A38.

**Abschlusskriterium:** Unit-Test „jeder Schlüssel in jeder Sprache“ und für
die Startsprache grün. E2E-Test 8 grün.

**Abnahme-Checkliste:**
- [ ] Mit deutscher Browsersprache startet das Spiel auf Deutsch.
- [ ] L auf dem Startbildschirm wechselt die Sprache, sie bleibt nach dem
      Neuladen.
- [ ] Alle Bildschirme sind vollständig übersetzt, nichts ist abgeschnitten.
- [ ] Datum in der Bestenliste im deutschen Format, Standardname „Katze“.
