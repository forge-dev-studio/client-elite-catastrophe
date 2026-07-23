// One-off: insert a "Storm & Roofing" nav link after "All Services" in desktop
// + mobile nav across every page, depth-aware and idempotent.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['data', 'docs', 'tools', '.git', 'node_modules', 'assets']);

function htmlFiles(dir = ROOT, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (!SKIP.has(name)) htmlFiles(p, out); }
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

const derive = x => x === './' ? 'storm-roofing' : x + 'storm-roofing';
let changed = 0;
for (const file of htmlFiles()) {
  let html = readFileSync(file, 'utf8');
  if (/>Storm &amp; Roofing<\/a>/.test(html)) continue; // idempotent
  const before = html;
  html = html.replace(/( *)(<a href="([^"]*)">All Services<\/a>)/g,
    (_, indent, anchor, x) => `${indent}${anchor}\n${indent}<a href="${derive(x)}">Storm &amp; Roofing</a>`);
  if (html !== before) { writeFileSync(file, html); changed++; console.log('nav+', relative(ROOT, file)); }
}
console.log(`done: ${changed} files`);
