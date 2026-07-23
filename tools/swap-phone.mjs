// Swap the published phone number sitewide: (706) 676-7364 -> (470) 777-8676
// (470-77-STORM). Covers display, tel: hrefs, and JSON-LD telephone, in HTML + site.json.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['docs', 'tools', '.git', 'node_modules', 'assets']);

const SUBS = [
  [/17066767364/g, '14707778676'],       // E.164 digits: tel:+1... and schema +1...
  [/\(706\) 676-7364/g, '(470) 777-8676'],// display format
];

function targets(dir = ROOT, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (!SKIP.has(name)) targets(p, out); }
    else if (name.endsWith('.html') || (name === 'site.json')) out.push(p);
  }
  return out;
}

let files = 0, total = 0;
for (const f of targets()) {
  let s = readFileSync(f, 'utf8'); const before = s;
  let n = 0;
  for (const [re, to] of SUBS) s = s.replace(re, m => { n++; return to; });
  if (s !== before) { writeFileSync(f, s); files++; total += n; console.log(`${n}\t${relative(ROOT, f)}`); }
}
console.log(`\nswapped ${total} occurrences across ${files} files -> (470) 777-8676 / +14707778676`);
