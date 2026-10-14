import { spawn } from 'node:child_process';
const root = new URL('../', import.meta.url);
const api = spawn('php', ['artisan', 'serve', '--host=127.0.0.1', '--port=8000'], { cwd: new URL('backend/', root), stdio: 'inherit' });
const ui = spawn('npm', ['run', 'dev', '--', '--host=127.0.0.1', '--strictPort'], { cwd: new URL('frontend/', root), stdio: 'inherit' });
let closing = false;
function close(code = 0) { if (closing) return; closing = true; api.kill(); ui.kill(); process.exitCode = code; }
api.on('exit', code => close(code || 0)); ui.on('exit', code => close(code || 0));
process.on('SIGINT', () => close()); process.on('SIGTERM', () => close());
