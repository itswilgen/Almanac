import { cpSync, mkdirSync, rmSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const target = new URL('backend/public/app/', root);
mkdirSync(target, { recursive: true });
rmSync(new URL('assets/', target), { recursive: true, force: true });
cpSync(new URL('frontend/dist/app/assets/', root), new URL('assets/', target), { recursive: true });
cpSync(new URL('frontend/dist/index.html', root), new URL('index.html', target));
cpSync(new URL('frontend/dist/favicon.svg', root), new URL('favicon.svg', target));
cpSync(new URL('frontend/dist/favicon.svg', root), new URL('backend/public/favicon.svg', root));
console.log('Production frontend copied to backend/public/app.');

