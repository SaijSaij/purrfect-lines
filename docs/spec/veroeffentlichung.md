# Veröffentlichung: öffentliches Repo, CI und GitHub Pages

Teil der [SPEC.md](../../SPEC.md). Festgelegt am 2026-11-11 mit
`project-details` im Modus Feature. Die Anforderungen A45–A55 folgen den
Regeln aus [anforderungen.md](anforderungen.md): Jede beschreibt sichtbares
Verhalten, unter **Prüfung** steht, woran man erkennt, dass sie erfüllt ist.
Die Meilensteine M9–M11 stehen in [meilensteine.md](meilensteine.md).

## Worum es geht

Das Repo wird öffentlich, eine CI prüft jeden Push auf main und jeden Pull
Request, und das Spiel ist unter `https://saijsaij.github.io/purrfect-lines/`
spielbar. Damit entfällt das Nicht-Ziel „Hosting im Internet“ (SPEC.md,
Abschnitt 5), und die Entscheidungen 6.1, 6.6 und 6.7 ändern sich.

**Warum jetzt:** Mit M1–M8 ist das Spiel fertig. Es soll sich zeigen und
teilen lassen, ohne dass jemand Node.js installiert. Stack und Code tragen das
ohne Umbau: Der Build erzeugt ohnehin statische Dateien, der Debug-Code fehlt
im Bundle (A44), es werden keine fremden Schriften oder Server geladen, und die
localStorage-Schlüssel tragen das Präfix `purrfect-lines.`. Das Präfix ist
wichtig, weil sich alle Pages-Projekte unter `saijsaij.github.io` einen
Speicher teilen.

## Entscheidungen

| Frage | Entscheidung | Begründung |
|---|---|---|
| Repo-Name | `purrfect-lines` statt `tetris` | Der alte Name stünde in der öffentlichen URL und widerspricht Abschnitt 1 der Spec. Der Rechteinhaber geht erfahrungsgemäß gegen solche Repos vor. GitHub leitet alte Links um. |
| Git-Historie | bleibt vollständig, mit der bisherigen Autoren-Adresse | Die Adresse ist ein Alias für GitHub. Ein Umschreiben würde die Commit-Hashes in meilensteine.md ungültig machen. |
| Lizenz | GPL-3.0-or-later | Wer den Code verändert weitergibt, muss ihn offenlegen. „or later“ empfiehlt die Free Software Foundation. |
| CI-Auslöser | Push auf main und Pull Requests | Meilenstein-Branches werden über einen Pull Request geprüft. Für fremde Pull Requests läuft die CI ebenfalls. |
| CI-Umfang | `check`, `e2e`, `check:release` | Das sind genau die automatischen Punkte der Definition of Done. |
| Browser-Tests in der CI | eine Wiederholung, Bericht als Artefakt | CI-Rechner sind langsamer, einzelne Timing-Ausreißer sollen den Lauf nicht rot machen. Lokal bleibt es streng. |
| Deploy | automatisch nach grüner CI auf main | Gepusht wird nur auf Anfrage, die Kontrolle bleibt also bei mir. Online liegt immer der geprüfte Stand von main. |
| Pinning der Actions | Commit-SHA mit Versionskommentar | Passt zur Regel „exakt gepinnt“ und schützt vor umgehängten Tags. |
| GitHub-Einstellungen | Claude per `gh`, fragt vor jedem Befehl | `gh` ist angemeldet und hat den Scope `repo`. |
| Handy und Tablet | Hinweis „Tastatur nötig“ | Touch bleibt ein Nicht-Ziel. Wer das Spiel auf dem Handy öffnet, soll aber sehen, warum nichts reagiert. |
| Quellcode im Spiel | dezenter Link unter dem Spiel | Die GPL verlangt, dass man an den Quellcode kommt. Ein Link im Spiel erfüllt das sauber. |
| Abnahme der Online-Version | zweistufig | Der Deploy läuft erst nach dem Push auf main, und der folgt laut Workflow erst auf die Abnahme. Stufe 1 prüft vor dem Merge alles Lokale und die CI im Pull Request, Stufe 2 nach Merge und Push die Live-Seite. |
| Branch und Pull Request für die CI | Claude fragt vor jedem Push und vor jedem Pull Request | Die Regel „Push nur auf Anfrage“ bleibt. |

## Anforderungen

**A45 Lizenz.** Im Wurzelverzeichnis liegt `LICENSE` mit dem unveränderten Text
der GPL-3.0. Er wird über die Lizenz-API von GitHub geholt
(`gh api licenses/gpl-3.0`) und nicht aus dem Gedächtnis geschrieben. In
`package.json` steht `"license": "GPL-3.0-or-later"`, `"private": true` bleibt
(das Paket wird nicht auf npm veröffentlicht). Die README hat einen Abschnitt
„License“, der GPL-3.0-or-later nennt.
*Prüfung:* Review; manuell: GitHub zeigt das Repo als GPL-3.0 an.

**A46 Quellcode-Link.** Unter dem Spielbereich steht auf allen Bildschirmen eine
dezente Zeile „Purrfect Lines · Source code · GPL-3.0“ bzw.
„Purrfect Lines · Quellcode · GPL-3.0“.
- Der Text kommt aus der Texttabelle (A37) und wechselt mit der Sprache (A38).
- „Source code“ bzw. „Quellcode“ ist ein Link auf
  `https://github.com/SaijSaij/purrfect-lines`. Die Adresse steht an einer
  Stelle im Code.
- Der Link öffnet einen neuen Tab (`target="_blank"`, `rel="noopener"`).
- Mit der Tab-Taste ist er nicht erreichbar (`tabindex="-1"`). Tasten wirken
  also weiter nur auf das Spiel, Enter öffnet nie den Link.
- Ein Klick lässt das Fenster den Fokus verlieren und pausiert ein laufendes
  Spiel nach A24.
- Nach einem Klick behält der Link den Fokus nicht. Kehrt man zum Spiel-Tab
  zurück, wirken Tasten auf das Spiel, in der Namenseingabe (A27) auf das
  Textfeld. Ein Enter nach der Rückkehr öffnet also keinen weiteren Tab.
  (Ergänzt nach dem Game-Designer-Review: `tabindex="-1"` verhindert nur den
  Weg per Tab-Taste, ein Mausklick gibt dem Link trotzdem den Fokus.)
- A31 gilt weiter: Der Spielbereich wird in den Platz über der Zeile skaliert,
  es gibt keine Bildlaufleisten.
- Die Zeile erscheint im Entwicklungsbuild und im Release.

*Prüfung:* E2E (Link vorhanden, Ziel, `target`, `rel`, `tabindex`, Text wechselt
mit L; Link anklicken, dann Enter: kein zweiter Tab, das Spiel reagiert). Der
bestehende E2E-Test 9 (Fenstergrößen) bleibt unverändert grün. Manuell:
dezent und lesbar, Rückkehr in die Namenseingabe.

**A47 Tastatur-Hinweis.** Hat das Gerät keinen feinen Zeiger (die Media-Query
`(any-pointer: fine)` trifft nicht zu, also Handy oder Tablet ohne Maus), steht
auf dem Startbildschirm anstelle von „Enter startet“ (A22) der Hinweis:
- EN: „This game is played with a physical keyboard – best opened on a
  computer.“
- DE: „Gespielt wird mit einer echten Tastatur – am besten am Computer
  öffnen.“

Der Text kommt aus der Texttabelle. Er steht an derselben Stelle wie „Enter
startet“, ist mindestens so groß und im Hoch- und Querformat ohne Zoomen
lesbar, auch neben voller Bestenliste und Speicherhinweis. Sonst ändert sich
nichts: Mit angeschlossener Tastatur startet Enter wie gewohnt. Ein Laptop mit
Touchpad hat einen feinen Zeiger und zeigt den Hinweis nicht.
*Begründung:* Ein geteilter Link wird oft auf dem Handy geöffnet. Dann ist der
Hinweis der erste Eindruck, und „Enter startet“ wäre dort eine Aufforderung,
die niemand befolgen kann. Der Text nennt eine echte Tastatur, damit man ihn
nicht auf die Bildschirmtastatur bezieht. (Game-Designer-Review)
*Prüfung:* E2E (mit Touch-Emulation erscheint der Hinweis statt „Enter
startet“, im normalen Desktop-Kontext nicht); manuell Lesbarkeit im
Gerätemodus und auf einem echten Handy.

**A48 Lauffähig unter einem Unterpfad.** Der Build verweist nur relativ auf
seine Dateien. So läuft er unter `/purrfect-lines/` auf GitHub Pages genauso
wie unter `/` bei `npm run preview`.
*Prüfung:* `npm run check:release` prüft zusätzlich, dass `dist/index.html`
keine absoluten Pfade (`src="/…"`, `href="/…"`) enthält; manuell auf der
Live-Seite.

**A49 CI.** Der Workflow `.github/workflows/ci.yml` läuft bei jedem Push auf
main und bei jedem Pull Request.
- Er läuft auf Ubuntu mit derselben exakten Node-Version wie lokal (A50).
- Die Schritte sind: `npm ci`, Chromium für Playwright mit seinen
  Systembibliotheken installieren (`--with-deps`), `npm run check`,
  `npm run e2e`, `npm run check:release`.
- Ein roter Schritt macht den ganzen Lauf rot.
- Der Prüf-Job hat nur das Recht `contents: read`. Der Checkout legt das Token
  nicht ab (`persist-credentials: false`), weil kein späterer Schritt es
  braucht.
- Ein Lauf bricht nach 20 Minuten ab. Der npm-Cache von `setup-node` ist
  eingeschaltet.
- In der CI macht ein vergessenes `test.only` in `e2e/` den Lauf rot
  (`forbidOnly`).

*Prüfung:* manuell (CI im Pull Request grün); Review.

**A50 Pinning in der CI.** Jede Action ist mit ihrem vollständigen Commit-SHA
und einem Versionskommentar gepinnt (`uses: actions/checkout@<sha> # v5.0.0`).
Die exakte Node-Version (26.13.0) steht nur in `.node-version`. Lokal wird
genau diese Version installiert, die CI liest sie mit `node-version-file`.
Actions und Node-Version werden nur auf meine Anfrage aktualisiert, die
Node-Version nur gemeinsam mit der lokalen Installation.
*Prüfung:* Review (`code-reviewer`).

**A51 Browser-Tests in der CI.** Nur in der CI (Umgebungsvariable `CI` gesetzt)
wird ein fehlgeschlagener Playwright-Test einmal wiederholt, lokal nie. Den
HTML-Bericht und Screenshots fehlgeschlagener Tests erzeugt Playwright nur in
der CI, lokal bleibt die Ausgabe wie bisher. Schlägt im Schritt `e2e` ein Test
endgültig fehl, lädt der Lauf den Bericht als Artefakt hoch, Aufbewahrung
7 Tage. Ist nur ein anderer Schritt rot, wird nichts hochgeladen.
*Prüfung:* Review. Einen manuellen Punkt gibt es nicht, weil dafür
absichtlich ein Fehler eingebaut werden müsste.

**A52 Deploy auf GitHub Pages.** Ist der Prüf-Job eines Pushes auf main grün,
baut ein zweiter Job im selben Workflow das Spiel und veröffentlicht `dist/` auf
GitHub Pages.
- Er nutzt die offiziellen Actions `configure-pages`, `upload-pages-artifact`
  und `deploy-pages` und die Umgebung `github-pages`.
- Bei Pull Requests und roten Läufen wird nicht deployt.
- Wartet ein Deploy und kommt ein neuerer Push, ersetzt der neuere ihn. Ein
  laufender Deploy wird nicht abgebrochen.
- Schlägt der Deploy fehl, bleibt die alte Version online, und der Lauf ist
  rot.
- Nur der Deploy-Job hat `pages: write` und `id-token: write`.
- Es gibt kein eigenes Secret, die Actions nutzen das Token, das GitHub für
  jeden Lauf bereitstellt.

*Prüfung:* manuell.

**A53 Repo-Einstellungen.** Das Repo heißt `SaijSaij/purrfect-lines` und ist
öffentlich.
- Beschreibung: „A cat-themed falling-block puzzle game for the browser.“
- Website: `https://saijsaij.github.io/purrfect-lines/`
- Pages-Quelle: „GitHub Actions“
- Das lokale Remote `origin` zeigt auf den neuen Namen.

Claude erledigt das per `gh` und fragt vor jedem Befehl einzeln. Die
Reihenfolge ist: umbenennen (M9), öffentlich stellen (Beginn M11, sobald die
Lizenz auf main liegt), Pages einrichten (M11). GitHub Pages geht bei einem
privaten Repo nur mit bezahltem Konto, deshalb wird das Repo vor Pages
öffentlich.
*Prüfung:* manuell.

**A54 Doku.**
- README: Link zum Online-Spiel, CI-Badge, Hinweis, dass eine Tastatur nötig
  ist, Abschnitt „License“.
- `docs/DEVELOPMENT.md`: was die CI prüft, wann deployt wird, wo man einen roten
  Lauf und den Playwright-Bericht findet, wie man die Action-Pins und die
  Node-Version aktualisiert.

*Prüfung:* `docs-reviewer`.

**A55 Favicon und Vorschau beim Teilen.** `index.html` hat:
- ein Favicon als Inline-SVG (Data-URI) mit dem gezeichneten Katzenkopf aus
  A35, ohne Bilddatei;
- `<meta name="description">`, `og:title` und `og:description` auf Englisch.
  Beschreibung: „A cat-themed falling-block puzzle game for the browser.“

Ein Vorschaubild (`og:image`) gibt es nicht, weil es eine Bilddatei bräuchte
(A35).
*Begründung:* Der Link soll geteilt werden. Ohne diese Angaben erscheint er im
Messenger ohne Vorschau, und der Tab zeigt das Standardsymbol.
(Game-Designer-Review)
*Prüfung:* Review; manuell (Symbol im Browser-Tab).

## Bewusst nicht enthalten

- **Zeile unter dem Spiel im laufenden Spiel abdunkeln:** Die Zeile ist ohnehin
  dezent, ein weiterer Zustand lohnt sich nicht. (Game-Designer-Review,
  KANN-Befund abgelehnt)

- **Eigene Domain:** Die Adresse unter `github.io` reicht.
- **Dependabot oder andere automatische Updates:** Updates nur auf Anfrage
  (A50).
- **Branch-Schutz auf main:** Ich arbeite allein und merge lokal.
- **Vorschau-Deploys für Pull Requests:** Die Abnahme läuft lokal.
- **Versionsanzeige im Spiel:** Der Stand ist im Actions-Lauf sichtbar.
- **Analytics, Cookies, fremde Ressourcen:** Das Spiel bleibt ohne Tracking.

## Offene Annahmen

| Annahme | Vorläufiger Standard |
|---|---|
| Impressum und Datenschutz | Das Spiel nutzt kein Tracking, keine Cookies und keine fremden Ressourcen; localStorage dient nur dem Spielstand. Als privates, nicht geschäftsmäßiges Hobbyprojekt bekommt es kein Impressum. Das ist keine rechtliche Prüfung. |
| Dauer eines CI-Laufs | etwa 5–6 Minuten (erster Lauf in M9: 5:36) |
