import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = path.join(root, 'app');
const appDist = path.join(app, 'dist');
const websiteDist = path.join(root, 'dist');
const destination = path.join(websiteDist, 'gast-app');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function normalizeBase(value = '') {
  const trimmed = value.trim();
  if (/[?#]/.test(trimmed)) throw new Error(`BASE darf weder Query noch Fragment enthalten: ${trimmed}`);
  const pathname = trimmed.replace(/^\/+|\/+$/g, '');
  return pathname ? `/${pathname}` : '';
}

function run(args, env = process.env) {
  console.log(`\n==> (app/) npm ${args.join(' ')}`);
  const result = spawnSync(npm, args, {
    cwd: app,
    env,
    stdio: 'inherit',
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}

if (!fs.existsSync(websiteDist)) {
  throw new Error('dist/ fehlt. Zuerst die Website bauen oder npm run build:with-app verwenden.');
}

const appWebBase = `${normalizeBase(process.env.BASE)}/gast-app`;
const exportEnv = { ...process.env, APP_WEB_BASE: appWebBase };

// npm ci hält den kombinierten Build reproduzierbar und unabhängig von einem
// möglicherweise vorhandenen lokalen app/node_modules. Audit, Typecheck und
// Jest gehören bewusst zum Kombibuild: Weder Pages noch Cloudflare dürfen
// eine Gäste-App ausliefern, deren separates App-CI gerade rot wäre.
run(['ci']);
run(['audit', '--audit-level=high']);
run(['run', 'export']);
run(['run', 'typecheck']);
run(['exec', '--', 'jest', '--runInBand']);
fs.rmSync(appDist, { recursive: true, force: true });
run(['exec', '--', 'expo', 'export', '--platform', 'web'], exportEnv);

if (!fs.existsSync(path.join(appDist, 'index.html'))) {
  throw new Error('Expo-Web-Export fehlt: app/dist/index.html wurde nicht erzeugt.');
}

fs.rmSync(destination, { recursive: true, force: true });
fs.cpSync(appDist, destination, { recursive: true });

// Expo schreibt statische Routen als `route.html` bzw. `route/slug.html`.
// Zusätzliche `route/index.html`-Aliase machen ALLE direkten Deep Links mit
// abschließendem Slash auch auf dateibasierten Hosts wie GitHub Pages
// zuverlässig. Template- und interne Expo-Routen bleiben dabei außen vor.
const routeFiles = walk(destination).filter((file) => file.endsWith('.html'));
let aliasCount = 0;
for (const source of routeFiles) {
  const rel = path.relative(destination, source);
  const name = path.basename(source, '.html');
  if (rel === 'index.html' || rel.endsWith(`${path.sep}index.html`) || /^[+_\[]/.test(name)) continue;

  const target = path.join(path.dirname(source), name, 'index.html');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  aliasCount += 1;
}

console.log(
  `\nGäste-App exportiert: ${path.relative(root, destination)}/ `
  + `(${aliasCount} Deep-Link-Aliase, APP_WEB_BASE=${appWebBase})`,
);
