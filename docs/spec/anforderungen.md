# Anforderungen

Teil der [SPEC.md](../../SPEC.md). Jede Anforderung beschreibt sichtbares
Verhalten und hat eine Nummer (A1, A2, ...), auf die Meilensteine und Tests
verweisen. Unter **Prüfung** steht, woran man erkennt, dass sie erfüllt ist.
„Unit“ heißt Vitest-Test der Spiellogik, „E2E“ heißt Playwright-Test,
„Manuell“ heißt Abnahme durch mich. Werte in `SCHREIBWEISE` sind Konstanten
(siehe [teststrategie.md](teststrategie.md#konstanten)).

Koordinaten: Spalten 1–10 von links, Reihen 1–20 von oben.

## Spielfeld und Formen

**A1 Spielfeld.** Das Spielfeld hat 10 Spalten und 20 Reihen und ist immer
vollständig sichtbar. Bereiche oberhalb von Reihe 1 gehören logisch zum Feld
(eine Form darf dorthin ragen), werden aber nicht gezeichnet.
*Prüfung:* Unit (Feldmaße, Zugriff außerhalb liefert „belegt“ für Wände und
Boden, „frei“ oberhalb).

**A2 Formen.** Es gibt sieben Formen aus je vier Blöcken. Jede hat eine eigene
Farbe. Anfangslage im jeweiligen Drehkasten (`X` = Block):

```
Stab (4×4)   Quadrat (2×2)   T (3×3)   S (3×3)   Z (3×3)   L (3×3)   J (3×3)
....         XX              .X.       .XX       XX.       ..X       X..
XXXX         XX              XXX       XX.       .XX       XXX       XXX
....                         ...       ...       ...       ...       ...
....
```

Im Code heißen die Formen `I`, `O`, `T`, `S`, `Z`, `L`, `J`.
*Prüfung:* Unit (Blockpositionen jeder Form in allen vier Lagen, siehe A8).

**A3 Formfolge (Beutel).** Die Formen kommen in Siebenergruppen. Jede Gruppe
enthält jede Form genau einmal, in zufälliger Reihenfolge. Zufall kommt aus
einem Zufallsgenerator mit Seed: Gleicher Seed ergibt gleiche Folge.
Randfall: Die erste Form eines Spiels ist beliebig (keine Sonderregel).
*Prüfung:* Unit (für 100 Seeds: in den ersten 70 Formen ist jede Siebenergruppe
eine Permutation aller sieben; zwei Läufe mit gleichem Seed sind gleich,
verschiedene Seeds liefern in der Regel verschiedene Folgen).

**A4 Erscheinen.** Eine neue Form erscheint in Anfangslage. Ihr Drehkasten
liegt waagerecht mittig: 3×3-Kasten in den Spalten 4–6, Quadrat in Spalte 5–6,
Stab in Spalte 4–7. Senkrecht liegt die oberste Blockreihe der Form in Reihe 1.
*Prüfung:* Unit (Blockpositionen jeder Form direkt nach dem Erscheinen).

**A5 Spielende.** Das Spiel endet, wenn
1. eine neue Form beim Erscheinen schon liegende Blöcke überlappt, oder
2. eine Form einrastet und dabei mindestens ein Block oberhalb von Reihe 1 liegt.

Im ersten Fall wird die neue Form nicht ins Feld übernommen.
*Prüfung:* Unit (beide Fälle mit vorbereitetem Feld), E2E (ein Spiel mit
festem Seed und nur hartem Fall endet, der Spielende-Zustand wird angezeigt).

## Bewegen und Drehen

**A6 Schieben.** ← / A schiebt die Form ein Feld nach links, → / D nach rechts.
Ist das Zielfeld durch Wand oder Blöcke belegt, passiert nichts.
*Prüfung:* Unit (freie Bewegung, Wand links und rechts, Block im Weg).

**A7 Tastenwiederholung.** Bleibt eine Schiebetaste gedrückt, wiederholt sich
die Bewegung nach `REPEAT_DELAY_MS` (170 ms) alle `REPEAT_INTERVAL_MS` (50 ms).
Sind beide Richtungen gedrückt, gilt die zuletzt gedrückte. Lässt man sie los,
gilt wieder die andere, mit neuer Verzögerung. Die automatische
Tastenwiederholung des Betriebssystems wird ignoriert.
*Prüfung:* Unit mit gesteuerter Zeit (Taste halten: 1 Schritt sofort, nach
170 ms der zweite, danach alle 50 ms einer; beide Richtungen gedrückt).

**A8 Drehen.** ↑ / W / X dreht im Uhrzeigersinn, Q / Y gegen den Uhrzeigersinn.
Die Form dreht sich um die Mitte ihres Drehkastens. Es gibt vier Lagen:
0 (Anfang), R (einmal im Uhrzeigersinn), 2 (zweimal), L (einmal dagegen).
Das Quadrat verändert sich beim Drehen nicht. Eine Drehtaste dreht pro Druck
genau einmal, gedrückt halten wiederholt nicht.
*Prüfung:* Unit (vier Drehungen in eine Richtung ergeben die Anfangslage; Lagen
aller Formen gegen eine Tabelle; Drehung im freien Feld).

**A9 Wall Kicks.** Passt die gedrehte Form nicht an ihre Stelle, probiert das
Spiel der Reihe nach diese Verschiebungen (x nach rechts positiv, **y nach
oben positiv**). Die erste, an der die Form passt, wird genommen. Passt keine,
bleibt die Form unverändert.

Für J, L, S, T, Z:

| Drehung | Test 1 | Test 2 | Test 3 | Test 4 | Test 5 |
|---|---|---|---|---|---|
| 0→R | (0,0) | (−1,0) | (−1,+1) | (0,−2) | (−1,−2) |
| R→0 | (0,0) | (+1,0) | (+1,−1) | (0,+2) | (+1,+2) |
| R→2 | (0,0) | (+1,0) | (+1,−1) | (0,+2) | (+1,+2) |
| 2→R | (0,0) | (−1,0) | (−1,+1) | (0,−2) | (−1,−2) |
| 2→L | (0,0) | (+1,0) | (+1,+1) | (0,−2) | (+1,−2) |
| L→2 | (0,0) | (−1,0) | (−1,−1) | (0,+2) | (−1,+2) |
| L→0 | (0,0) | (−1,0) | (−1,−1) | (0,+2) | (−1,+2) |
| 0→L | (0,0) | (+1,0) | (+1,+1) | (0,−2) | (+1,−2) |

Für den Stab:

| Drehung | Test 1 | Test 2 | Test 3 | Test 4 | Test 5 |
|---|---|---|---|---|---|
| 0→R | (0,0) | (−2,0) | (+1,0) | (−2,−1) | (+1,+2) |
| R→0 | (0,0) | (+2,0) | (−1,0) | (+2,+1) | (−1,−2) |
| R→2 | (0,0) | (−1,0) | (+2,0) | (−1,+2) | (+2,−1) |
| 2→R | (0,0) | (+1,0) | (−2,0) | (+1,−2) | (−2,+1) |
| 2→L | (0,0) | (+2,0) | (−1,0) | (+2,+1) | (−1,−2) |
| L→2 | (0,0) | (−2,0) | (+1,0) | (−2,−1) | (+1,+2) |
| L→0 | (0,0) | (+1,0) | (−2,0) | (+1,−2) | (−2,+1) |
| 0→L | (0,0) | (−1,0) | (+2,0) | (−1,+2) | (+2,−1) |

Das Quadrat braucht keine Tabelle.
*Prüfung:* Unit (senkrechter Stab an linker und rechter Wand dreht sich
waagerecht; T in einer Lücke nimmt Test 3 oder später; Fall „keine passt“
lässt die Form unverändert).

**A10 Schwerkraft.** Die Form fällt alle `GRAVITY_MS[level]` Millisekunden um
eine Reihe:

| Level | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15+ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ms | 1000 | 850 | 720 | 610 | 520 | 440 | 370 | 310 | 260 | 215 | 175 | 140 | 110 | 80 | 50 |

Ab Level 15 wird es nicht schneller, das Level steigt aber weiter.
*Prüfung:* Unit mit gesteuerter Zeit (nach 999 ms noch keine Bewegung, nach
1000 ms eine Reihe; Level 20 nutzt 50 ms).

**A11 Weicher Fall.** Solange ↓ / S gedrückt ist, fällt die Form mit
Intervall `GRAVITY_MS[level] / SOFT_DROP_FACTOR` (Faktor 20). Jede so
gefallene Reihe bringt `SOFT_DROP_POINTS` (1) Punkt. Liegt die Form auf,
ändert der weiche Fall nichts an der Gnadenfrist (A13).
*Prüfung:* Unit (Fallgeschwindigkeit und Punkte).

**A12 Harter Fall.** Leertaste lässt die Form sofort bis zur tiefsten
möglichen Position fallen und rastet sie ohne Gnadenfrist ein. Jede
übersprungene Reihe bringt `HARD_DROP_POINTS` (2) Punkte. Gedrückt halten
löst keinen zweiten harten Fall aus.
*Prüfung:* Unit (Endposition, Punkte, sofortiges Einrasten), E2E (Leertaste
lässt eine Form sichtbar unten landen).

**A13 Gnadenfrist beim Einrasten.** Liegt die Form auf, rastet sie nach
`LOCK_DELAY_MS` (500 ms) ein. Jede erfolgreiche Bewegung oder Drehung in dieser
Zeit startet die Frist neu, höchstens `LOCK_RESETS_MAX` (15) Mal pro Form.
Erreicht die Form eine tiefere Reihe als je zuvor, wird der Zähler wieder auf
0 gesetzt. Ist der Zähler aufgebraucht, rastet die Form ein, sobald sie
aufliegt. Hebt eine Bewegung die Form vom Boden ab (über eine Kante), läuft
die Frist nicht, und die Schwerkraft gilt wieder.
*Prüfung:* Unit mit gesteuerter Zeit (Einrasten nach 500 ms; Zurücksetzen
durch Bewegung; nach 15 Zurücksetzungen sofortiges Einrasten; Rücksetzen des
Zählers bei neuer tiefster Reihe).

**A14 Geisterstein.** Unter der fallenden Form wird ihre Landeposition als
blasser Umriss in der Farbe der Form gezeigt. Überlappt sie die Form, wird nur
die Form gezeichnet.
*Prüfung:* Unit (berechnete Landeposition = Position nach hartem Fall),
Manuell (gut sichtbar, nicht mit echten Blöcken zu verwechseln).

## Reihen, Punkte, Level

**A15 Reihen auflösen.** Nach dem Einrasten werden alle vollen Reihen
entfernt, auch nicht zusammenhängende. Alles darüber rutscht um die Zahl der
entfernten Reihen darunter nach unten. Es gibt keine „Schwerkraft“ für
einzelne Blöcke.
*Prüfung:* Unit (1, 2, 3, 4 Reihen; Reihen 17 und 19 voll, 18 nicht).

**A16 Animation beim Auflösen.** Volle Reihen leuchten auf und verschwinden in
`LINE_CLEAR_MS` (300 ms). Erst danach rutscht der Rest nach und die nächste
Form erscheint. In dieser Zeit wirken nur Pause und Fokusverlust, alle anderen
Spieltasten werden ignoriert. Punkte, Reihen und Level zählen sofort beim
Einrasten.
*Prüfung:* Unit mit gesteuerter Zeit (neue Form erst nach 300 ms; Eingaben
dazwischen ohne Wirkung), Manuell (Animation sichtbar und nicht störend).

**A17 Punkte.** Aufgelöste Reihen bringen `LINE_POINTS` × Level, wobei das
Level vor dem Auflösen gilt: 1 Reihe 100, 2 Reihen 300, 3 Reihen 500,
4 Reihen 800. Dazu kommen die Punkte aus A11 und A12 (nicht mit dem Level
multipliziert).
*Prüfung:* Unit (alle vier Fälle auf Level 1 und 3; Levelwechsel durch das
Auflösen selbst nutzt das alte Level).

**A18 Level.** Ein Spiel beginnt auf Level 1 (oder dem Startlevel aus A41).
Level = Startlevel + ⌊aufgelöste Reihen / `LINES_PER_LEVEL`⌋ (10). Es gibt kein
Höchstlevel.
*Prüfung:* Unit (9 Reihen → Level 1, 10 → 2, 4 Reihen auf einmal bei 8 → 12
Reihen, Level 2; Startlevel 5 mit 10 Reihen → Level 6).

**A19 Vorschau.** Neben dem Spielfeld wird die nächste Form gezeigt. Sie ist
immer die Form, die als nächste erscheint.
*Prüfung:* Unit (Vorschau = nächstes Element der Folge aus A3), E2E (Vorschau
sichtbar).

**A20 Anzeige.** Neben dem Spielfeld stehen Punkte, aufgelöste Reihen und
Level und werden sofort aktualisiert.
*Prüfung:* E2E (nach einem harten Fall mit festem Seed sind die Punkte > 0),
Manuell (gut lesbar).

## Tastatur

**A21 Tastenbelegung.**

| Aktion | Tasten |
|---|---|
| Links / rechts schieben | ← / → und A / D |
| Weicher Fall | ↓ und S |
| Drehen im Uhrzeigersinn | ↑, W und X |
| Drehen gegen den Uhrzeigersinn | Q und Y |
| Harter Fall | Leertaste |
| Pause / fortsetzen | P und Esc |
| Musik an/aus | M |
| Klänge an/aus | N |
| Bestätigen in Menüs | Enter |
| Auswahl in Menüs | ↑ / ↓ und W / S |

Buchstaben werden über das eingegebene Zeichen erkannt (Groß- und
Kleinschreibung egal), damit Y auch auf der deutschen Tastatur am erwarteten
Platz liegt. Tasten, die das Spiel nutzt, lösen keine Browseraktion aus (z. B.
scrollt die Leertaste die Seite nicht).
*Prüfung:* Unit (Zuordnung Taste → Aktion, auch für Großbuchstaben), E2E
(Pfeiltaste bewegt die Form).

## Ablauf und Bildschirme

**A22 Startbildschirm.** Beim Öffnen erscheint der Startbildschirm mit Titel,
dem Hinweis „Enter startet“, einer kurzen Tastenübersicht und der Bestenliste
(A28). Enter startet ein neues Spiel.
*Prüfung:* E2E (Startbildschirm sichtbar; Enter startet, eine Form fällt).

**A23 Pause.** P oder Esc pausiert ein laufendes Spiel. Während der Pause ist
das Spielfeld verdeckt, die Zeit steht, und es gibt ein Menü mit
„Fortsetzen“ und „Aufgeben“ (Auswahl nach A21). P, Esc oder Enter auf
„Fortsetzen“ setzen fort. Nach dem Fortsetzen geht es genau dort weiter, wo
pausiert wurde (auch Gnadenfrist und Animation laufen weiter).
*Prüfung:* Unit (Zeit läuft in der Pause nicht weiter), E2E (P zeigt Pause,
Feld verdeckt; erneut P setzt fort).

**A24 Pause bei Fokusverlust.** Verliert das Fenster den Fokus oder wird der
Tab unsichtbar, pausiert ein laufendes Spiel automatisch. Bei Rückkehr bleibt
es pausiert. Gedrückt gehaltene Tasten gelten als losgelassen.
*Prüfung:* E2E (Ereignis `blur` bzw. `visibilitychange` auslösen → Pause).

**A25 Aufgeben.** „Aufgeben“ im Pausemenü beendet das Spiel regulär wie A5:
Es folgt der Spielende-Bildschirm, und die Punkte zählen für die Bestenliste.
*Prüfung:* E2E (Pause → Aufgeben → Spielende-Bildschirm).

**A26 Spielende-Bildschirm.** Er zeigt Punkte, Reihen und Level. Reicht die
Punktzahl für die Bestenliste (A29), folgt die Namenseingabe (A27), sonst
führt Enter zurück zum Startbildschirm.
*Prüfung:* E2E (Spielende mit festem Seed zeigt die Werte).

**A27 Namenseingabe.** Ein Textfeld, vorausgefüllt mit dem zuletzt
eingegebenen Namen (beim allerersten Mal leer). Höchstens `NAME_MAX_LENGTH`
(12) Zeichen, weitere Eingaben werden nicht angenommen. Leerzeichen am Anfang
und Ende werden entfernt. Ist der Name danach leer, wird der Standardname aus
der Texttabelle verwendet (EN „Kitty“, DE „Katze“). Enter speichert den
Eintrag und zeigt die Bestenliste mit hervorgehobenem neuen Eintrag; ein
weiteres Enter führt zum Startbildschirm. Esc überspringt die Eingabe, dann
wird **kein** Eintrag gespeichert. Spieltasten (z. B. Leertaste, Q) wirken im
Textfeld nur als Text.
*Prüfung:* Unit (Kürzen, Trimmen, Standardname), E2E (Name eingeben, Enter,
Eintrag steht in der Liste; Esc speichert nichts).

**A28 Bestenliste anzeigen.** Höchstens `HIGHSCORE_SIZE` (10) Einträge, nach
Punkten absteigend, mit Platz, Name, Punkten, Reihen, Level und Datum (Datum
im Format der gewählten Sprache). Ist sie leer, steht dort ein Hinweis
(„Noch keine Einträge“).
*Prüfung:* E2E (Liste auf dem Startbildschirm), Manuell (Lesbarkeit).

**A29 Bestenliste führen.** Eine Partie kommt in die Liste, wenn ihre Punktzahl
größer als 0 ist und die Liste weniger als 10 Einträge hat oder die Punktzahl
größer ist als die des letzten Eintrags. Bei gleicher Punktzahl steht der
ältere Eintrag vorn. Ein elfter Eintrag verdrängt den letzten.
*Prüfung:* Unit (Einfügen, Sortierung, Gleichstand, Verdrängen, 0 Punkte).

**A30 Speichern und Fehler.** Bestenliste und Einstellungen (Ton, Sprache,
letzter Name) stehen im localStorage des Browsers und überleben ein Neuladen.
- Ist der Speicher nicht verfügbar oder schlägt Schreiben fehl, läuft das
  Spiel normal weiter. Die Bestenliste gilt dann nur bis zum Neuladen, und auf
  dem Startbildschirm steht ein kurzer Hinweis.
- Sind gespeicherte Daten unlesbar, werden sie verworfen und durch eine leere
  Liste bzw. die Standardeinstellungen ersetzt. Einzelne ungültige Einträge
  (falsche Typen, negative Punkte) werden verworfen, gültige bleiben.
*Prüfung:* Unit (Speicher-Attrappe: wirft Fehler, enthält Unsinn, enthält
gemischte Einträge), E2E (Eintrag ist nach Neuladen noch da).

**A31 Fenstergröße.** Der Spielbereich (Feld und Seitenleiste) wird zentriert
und so groß wie möglich ins Fenster skaliert, mit festem Seitenverhältnis und
scharf auch bei Bildschirmskalierung (devicePixelRatio). Ändert sich die
Fenstergröße, passt er sich sofort an. Es gibt keine Bildlaufleisten.
*Prüfung:* E2E (zwei Fenstergrößen: Spielbereich passt hinein, keine
Bildlaufleisten), Manuell (scharf, auch bei 125 %/150 % Skalierung).

## Ton

**A32 Klänge.** Eigene, zur Laufzeit synthetisierte Klänge für: Drehen,
Einrasten, harter Fall, 1–3 Reihen aufgelöst, 4 Reihen aufgelöst (miau-artig),
Level-Aufstieg, Spielende, Menüauswahl. Schieben ist still.
*Prüfung:* Unit (Spiellogik meldet die passenden Ereignisse), Manuell (Klänge
angenehm, unterscheidbar, nicht zu laut).

**A33 Musik.** Eine eigene, zur Laufzeit synthetisierte Musikschleife läuft
während des Spiels. Ihr Tempo steigt pro Level um `MUSIC_TEMPO_STEP` (3 %), bis
höchstens `MUSIC_TEMPO_MAX` (+40 %). In der Pause und auf den Menübildschirmen
schweigt sie, nach dem Fortsetzen läuft sie weiter.
*Prüfung:* Unit (Tempoberechnung), Manuell (eigene Melodie, keine Anlehnung an
bekannte Stücke, Schleife ohne hörbaren Sprung).

**A34 Ton schalten.** M schaltet die Musik, N die Klänge an und aus, auf jedem
Bildschirm außer in der Namenseingabe. Beim ersten Start ist beides an. Der
Zustand wird gespeichert (A30) und ist im Spiel klein sichtbar (z. B. Symbol
in der Seitenleiste). Ton beginnt erst nach dem ersten Tastendruck, weil
Browser vorher keinen Ton erlauben.
*Prüfung:* Unit (Umschalten und Speichern), E2E (M ändert den gespeicherten
Zustand, bleibt nach Neuladen).

## Gestaltung

**A35 Eigene Gestaltung.** Eigene, warme Farbpalette, an einer Stelle im Code
definiert. Die sieben Formen sind klar unterscheidbar. Die Zuordnung von
Farben zu Formen ist nicht die im Genre übliche (z. B. ist der Stab nicht
hellblau). Blöcke tragen einen kleinen Pfotenabdruck, der Titel einen
gezeichneten Katzenkopf. Alles wird im Code gezeichnet, ohne Bilddateien.
*Prüfung:* Manuell (Checkliste in M7).

**A36 Keine fremden Marken.** Der Markenname eines bestehenden Spiels kommt
weder im Spiel noch im Code noch in der Doku vor.
*Prüfung:* automatisch per Suche im Repo (Teil des Reviews), Manuell.

## Texte und Sprache

**A37 Texttabelle.** Alle Texte im Spiel stehen in einer Texttabelle mit
Schlüsseln, getrennt nach Sprache. Im Code steht kein sichtbarer Text direkt.
*Prüfung:* Review, Unit (jeder Schlüssel hat in jeder Sprache einen
nicht leeren Text).

**A38 Deutsch und Englisch.** Das Spiel gibt es auf Englisch und Deutsch. Beim
ersten Start gilt Deutsch, wenn die Browsersprache mit `de` beginnt, sonst
Englisch. Auf dem Startbildschirm wechselt L die Sprache. Die Wahl wird
gespeichert (A30).
*Prüfung:* Unit (Auswahl der Startsprache), E2E (L wechselt die Sprache, bleibt
nach Neuladen).

## Testhilfen (nur Entwicklungsbuild)

Testhilfen werden über URL-Parameter eingeschaltet, z. B.
`http://localhost:5173/?seed=42&level=10`. Ungültige Werte werden ignoriert
und in der Konsole gemeldet.

**A39 Fester Seed.** `?seed=<ganze Zahl>` legt den Seed für die Formfolge
fest. Ohne Parameter ist der Seed bei jedem Spiel zufällig.
*Prüfung:* E2E (zweimal mit gleichem Seed: gleiche erste Formen).

**A40 Startlevel.** `?level=<1–99>` lässt jedes Spiel auf diesem Level
beginnen (siehe A18).
*Prüfung:* Unit (Level-Berechnung), E2E (Anzeige zeigt das Level).

**A41 Zeitlupe.** `?slow=<1–10>` lässt das ganze Spiel um diesen Faktor
langsamer laufen (Schwerkraft, Gnadenfrist, Animationen, Tastenwiederholung).
*Prüfung:* Unit (Zeitfaktor wird angewendet).

**A42 Debug-Anzeige.** `?debug` zeigt am Rand als Text: Level,
Fallintervall, verbleibende Gnadenfrist und Zurücksetzungen, Inhalt des
aktuellen Beutels, Seed und Bilder pro Sekunde.
*Prüfung:* Manuell.

**A43 Testschnittstelle.** Im Entwicklungsbuild stellt das Spiel unter
`window.__purrfectLines` einen nur lesenden Zustand bereit: aktueller
Bildschirm, Feld, aktuelle und nächste Form, Punkte, Reihen, Level. Die
Playwright-Tests lesen ihn, statt Pixel zu vergleichen.
*Prüfung:* E2E nutzen ihn.

**A44 Nicht im Release.** Im fertigen Build (`npm run build`) gibt es weder
die Parameter aus A39–A42 noch die Schnittstelle aus A43. Der Code dafür ist
im Bundle nicht enthalten.
*Prüfung:* automatisch: ein Skript baut das Spiel und prüft, dass eindeutige
Markierungen aus dem Debug-Code in `dist/` fehlen. Es läuft als eigenes
npm-Skript `npm run check:release` und gehört zur Definition of Done.

## Bewusst nicht enthalten

- **Halten einer Form:** im Interview abgewählt. Nachrüsten wäre *billig*
  (eine weitere Taste und ein Feld in der Seitenleiste).
- **Startlevel-Auswahl im Spiel:** nur als Testhilfe (A40). Der Ablauf bleibt
  so einfach wie möglich.
- **Lautstärkeregler:** An/aus reicht (A34).
- **Bonuspunkte für Kombos oder besondere Drehungen:** Die Punktevergabe bleibt
  bei A17.
