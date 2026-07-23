// Make the VISIBLE phone read "470-77-STORM" while the machine layer stays numeric.
// Replaces the display string (470) 777-8676 -> 470-77-STORM in body text ONLY.
// Skips <meta> lines (head / Google-facing keep the numeric form). tel: hrefs and
// JSON-LD "telephone" use +14707778676 and never match the display string, so the
// click-to-call target and the schema Google reads stay 470-777-8676.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['docs', 'tools', '.git', 'node_modules', 'assets', 'data']);
const DISPLAY = /\(470\) 777-8676/g;
const VANITY = '470-77-STORM';

function htmlFiles(dir = ROOT, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (!SKIP.has(name)) htmlFiles(p, out); }
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

let files = 0, total = 0;
for (const f of htmlFiles()) {
  const lines = readFileSync(f, 'utf8').split('\n');
  let n = 0;
  const out = lines.map(line => {
    if (/<meta/i.test(line)) return line;      // head/meta: keep numeric
    return line.replace(DISPLAY, () => { n++; return VANITY; });
  });
  if (n) { writeFileSync(f, out.join('\n')); files++; total += n; console.log(`${n}\t${relative(ROOT, f)}`); }
}
console.log(`\ndisplay -> "${VANITY}": ${total} spots across ${files} files (tel: + schema stay +14707778676)`);
