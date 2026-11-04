import { describe, expect, test } from 'bun:test';
import { legalRoutes } from './legal';

describe('legal pages', () => {
  test('GET /privacy is honest HTML for Play Console', async () => {
    const response = await legalRoutes.request('/privacy');
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');
    const html = await response.text();
    expect(html).toContain('Privacy Policy');
    expect(html).toContain('manasseh@iotready.co');
    expect(html).toContain('Google Sign-In');
    expect(html).toContain('JWT');
    expect(html).toContain('18');
    expect(html).toContain('uploads/profiles');
    expect(html).toContain('city');
  });

  test('GET /terms covers 18+, UGC, and deletion', async () => {
    const response = await legalRoutes.request('/terms');
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain('Terms of Service');
    expect(html).toContain('18');
    expect(html).toContain('Block');
    expect(html).toContain('delete');
    expect(html).toContain('manasseh@iotready.co');
  });
});
