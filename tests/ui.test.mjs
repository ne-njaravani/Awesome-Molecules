import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const js = readFileSync(new URL('../dist/app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../dist/styles.css', import.meta.url), 'utf8');

test('every directly referenced element ID exists in the page', () => {
  const ids = [...js.matchAll(/\$\('([^']+)'\)/g)].map(match => match[1]);
  const missing = [...new Set(ids)].filter(id => !html.includes(`id="${id}"`));
  assert.deepEqual(missing, []);
});

test('desktop chat-first UI has clear Ask and Agent controls', () => {
  assert.match(html, /What would you like to do\?/);
  assert.match(html, /data-mode="ask"/);
  assert.match(html, /data-mode="agent"/);
  assert.match(html, /id="composer-input"/);
  assert.match(html, /id="file-input"/);
  assert.match(html, /id="messages"/);
  assert.match(css, /min-width: 1060px/);
  assert.match(html, /id="load-demo-data"/);
  assert.match(html, /Review ROI progress/);
  assert.match(html, /Review AI risks/);
});

test('navigation preserves usage and technical adapter demonstration', () => {
  for (const id of ['insights-page','provider-bars','activity-rows','adapter-dialog','adapter-input','adapter-request','adapter-output']) {
    assert.ok(html.includes(`id="${id}"`));
  }
  assert.match(html, /Safe sample transformation only/);
  assert.match(html, /not AI-generated/);
});

test('minimal style intentionally avoids decorative gradients and mobile-only UI', () => {
  assert.doesNotMatch(css, /linear-gradient\(|radial-gradient\(/);
  assert.match(css, /--ink: #171717/);
  assert.match(css, /--line: #e7e7e7/);
  assert.doesNotMatch(html, /mobile-menu/);
});
