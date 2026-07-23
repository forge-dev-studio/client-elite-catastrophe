// Normalize internal hrefs to extensionless clean URLs across all HTML files.
// Safety net so hand- and agent-authored pages can be written naturally and
// still pass verify gate 12. src attributes are untouched (assets keep extensions).
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

let changed = 0;
for (const file of htmlFiles()) {
  const before = readFileSync(file, 'utf8');
  const after = before.replace(/href="([^"]+)"/g, (m, url) => {
    if (/^(https?:|tel:|mailto:|#|data:|\/)/i.test(url)) return m;
    const [path, tail = ''] = url.split(/(?=[?#])/);
    if (!/\.html$/i.test(path)) return m;
    let clean;
    if (/(^|\/)index\.html$/i.test(path)) {
      clean = path.replace(/index\.html$/i, '');
      if (clean === '') clean = './';
    } else {
      clean = path.replace(/\.html$/i, '');
    }
    return `href="${clean}${tail}"`;
  });
  if (after !== before) {
    writeFileSync(file, after);
    changed++;
    console.log('cleaned', relative(ROOT, file));
  }
}
console.log(`done: ${changed} file(s) updated`);
