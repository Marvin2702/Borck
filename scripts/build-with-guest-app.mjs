import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const env = { ...process.env, PUBLIC_GUEST_APP_ENABLED: 'true' };

function run(script) {
  console.log(`\n==> npm run ${script}`);
  const result = spawnSync(npm, ['run', script], {
    cwd: root,
    env,
    stdio: 'inherit',
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

// Der normale Website-Build bleibt bewusst eigenständig. Nur dieser explizite
// Kombi-Einstieg aktiviert den App-Link und ergänzt anschließend den Expo-Build.
run('build');
run('build:guest-app');
run('audit:guest-app');
