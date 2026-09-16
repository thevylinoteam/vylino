import { spawn, spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const distDir = dirname(fileURLToPath(import.meta.url));
const node = process.execPath;

process.env.NODE_ENV = 'production';
if (!process.env.NODE_PORT && process.env.PORT) {
  process.env.NODE_PORT = process.env.PORT;
}

const run = (relativePath, args = [], { optional = false } = {}) => {
  const result = spawnSync(node, [join(distDir, relativePath), ...args], {
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0 && !optional) {
    process.exit(result.status ?? 1);
  }

  return result.status === 0;
};

if (process.env.DISABLE_DB_MIGRATIONS !== 'true') {
  console.log('Running Vylino CRM database setup and migrations...');
  run('database/scripts/setup-db.js');
  run('command/command.js', ['run-instance-commands', '--force', '--include-slow']);
  run('command/command.js', ['cache:flush'], { optional: true });
  run('command/command.js', ['upgrade'], { optional: true });
  run('command/command.js', ['cache:flush'], { optional: true });
}

if (process.env.DISABLE_CRON_JOBS_REGISTRATION !== 'true') {
  run('command/command.js', ['cron:register:all'], { optional: true });
}

console.log('Starting Vylino CRM server and queue worker...');

const worker = spawn(node, [join(distDir, 'queue-worker/queue-worker.js')], {
  stdio: 'inherit',
  env: process.env,
});

const server = spawn(node, [join(distDir, 'main.js')], {
  stdio: 'inherit',
  env: process.env,
});

const shutdown = (signal) => {
  worker.kill(signal);
  server.kill(signal);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

server.on('exit', (code, signal) => {
  worker.kill('SIGTERM');
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});

worker.on('exit', (code, signal) => {
  if (code && code !== 0) {
    console.error(`Queue worker exited unexpectedly (${signal ?? code}).`);
  }
});
