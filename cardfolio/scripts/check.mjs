import { readdir, readFile, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { isBuiltin } from 'node:module';
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const failures = [];
const resources = new Set();

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesIn(path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

async function checkReference(source, reference, moduleImport = false) {
  if (!reference || reference.startsWith('#') || /^(?:[a-z][\w+.-]*:|\/\/)/i.test(reference)) return;
  if (moduleImport && !reference.startsWith('.') && !reference.startsWith('/')) {
    if (!isBuiltin(reference)) failures.push(`${relative(root, source)}: unresolved bare import ${reference}`);
    return;
  }
  const clean = reference.split(/[?#]/, 1)[0];
  if (!clean) return;
  let target;
  try {
    target = resolve(reference.startsWith('/') ? root : dirname(source), decodeURIComponent(clean).replace(/^\/+/, ''));
  } catch {
    failures.push(`${relative(root, source)}: invalid reference ${reference}`);
    return;
  }
  const path = relative(root, target);
  if (isAbsolute(path) || path === '..' || path.startsWith(`..${sep}`)) {
    failures.push(`${relative(root, source)}: reference escapes website root: ${reference}`);
    return;
  }
  try {
    if (!(await stat(target)).isFile()) throw new Error('not a file');
    resources.add(target);
  } catch {
    failures.push(`${relative(root, source)}: missing resource ${reference}`);
  }
}

const files = await filesIn(root);
let scripts = 0;
for (const file of files) {
  const extension = extname(file);
  if (!['.html', '.css', '.js', '.mjs'].includes(extension)) continue;
  const source = await readFile(file, 'utf8');
  if (extension === '.html') {
    for (const match of source.matchAll(/<(?:script|link|img|source|video|audio)\b[^>]*?\b(?:src|href|poster)\s*=\s*['"]([^'"]+)['"]/gi)) {
      await checkReference(file, match[1]);
    }
  }
  if (extension === '.css') {
    for (const match of source.matchAll(/url\(\s*['"]?([^'"\s)]+)['"]?\s*\)|@import\s+['"]([^'"]+)['"]/gi)) {
      await checkReference(file, match[1] || match[2]);
    }
  }
  if (extension === '.js' || extension === '.mjs') {
    scripts += 1;
    const syntax = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    if (syntax.error || syntax.status !== 0) {
      failures.push(`${relative(root, file)}: ${syntax.error?.message || syntax.stderr.trim() || 'JavaScript syntax check failed'}`);
    }
    for (const match of source.matchAll(/\b(?:import|export)\s+(?:[^'";]*?\s+from\s*)?['"]([^'"]+)['"]|\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) {
      await checkReference(file, match[1] || match[2], true);
    }
  }
}

if (failures.length) {
  console.error(`Checks failed (${failures.length}):\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`Checks passed: ${scripts} JavaScript files, ${resources.size} local resource/import targets.`);
}
