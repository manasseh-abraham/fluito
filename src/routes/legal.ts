import { Hono } from 'hono';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const legalRoutes = new Hono();

function legalPage(filename: string): string {
  return readFileSync(join(import.meta.dir, '..', 'legal', filename), 'utf8');
}

legalRoutes.get('/privacy', (c) => c.html(legalPage('privacy.html')));
legalRoutes.get('/terms', (c) => c.html(legalPage('terms.html')));
