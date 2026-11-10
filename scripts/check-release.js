/* global process, console */
// Release check (A44): builds the game and verifies that the debug code
// (URL parameters A39–A42, test interface A43) is not in the bundle.
//
// The debug code must contain each marker below. The check fails if a marker
// is missing from src/ (the check would prove nothing) or appears in dist/.
import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const MARKERS = ['__purrfectLines', 'purrfect-lines-debug'];

function filesIn(dir) {
  return readdirSync(dir, { recursive: true })
    .map((name) => join(dir, String(name)))
    .filter((path) => statSync(path).isFile());
}

function filesContaining(files, marker) {
  return files.filter((path) => readFileSync(path, 'utf8').includes(marker));
}

const sourceFiles = filesIn('src').filter(
  (path) => !path.endsWith('.test.ts') && !path.endsWith('testing.ts'),
);
const errors = [];

for (const marker of MARKERS) {
  if (filesContaining(sourceFiles, marker).length === 0) {
    errors.push(`Marker "${marker}" not found in src/: the debug code must contain it.`);
  }
}

let built = true;
try {
  execSync('npm run build', { stdio: 'inherit' });
} catch {
  built = false;
  errors.push('npm run build failed.');
}

if (built) {
  for (const marker of MARKERS) {
    for (const path of filesContaining(filesIn('dist'), marker)) {
      errors.push(`Marker "${marker}" found in release bundle: ${path}`);
    }
  }
}

if (errors.length > 0) {
  console.error('check:release failed:');
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}
console.log(`check:release passed: ${MARKERS.length} debug markers absent from dist/.`);
