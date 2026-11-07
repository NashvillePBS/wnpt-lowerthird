// Drives endcards/selftest.html in headless Chrome over the DevTools protocol and prints its JSON on stdout.
// One page load per style keeps each DevTools message small. Needs only Node 22+ (built-in WebSocket) and
// Google Chrome. Used by scripts/verify-graphics.py; run it alone with the harness URL to debug.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const base = process.argv[2];
if (!base) { console.error('usage: node endcards-harness.mjs <harness url>'); process.exit(2); }

const udd = mkdtempSync(join(tmpdir(), 'ec-chrome-'));
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
  '--window-size=1920,1080', '--remote-debugging-port=0', '--user-data-dir=' + udd, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
const cleanup = () => { try { chrome.kill(); } catch {} try { rmSync(udd, { recursive: true, force: true }); } catch {} };
process.on('exit', cleanup);

const wsUrl = await new Promise((res, rej) => {
  let buf = '';
  chrome.stderr.on('data', d => { buf += d; const m = buf.match(/DevTools listening on (ws:\/\/\S+)/); if (m) res(m[1]); });
  chrome.on('exit', () => rej(new Error('chrome exited before DevTools was ready')));
  setTimeout(() => rej(new Error('DevTools did not come up')), 30000);
});
const ws = new WebSocket(wsUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let id = 0; const pending = new Map(); const errors = [];
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return; }
  if (m.method === 'Runtime.exceptionThrown') errors.push('exception: ' + JSON.stringify(m.params.exceptionDetails).slice(0, 500));
  if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) errors.push(m.params.type + ': ' + m.params.args.map(a => a.value ?? a.description ?? '').join(' ').slice(0, 300));
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errors.push('log: ' + m.params.entry.text.slice(0, 300) + ' ' + (m.params.entry.url || ''));
};
const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
  const i = ++id; pending.set(i, m => m.error ? rej(new Error(method + ': ' + JSON.stringify(m.error))) : res(m.result));
  ws.send(JSON.stringify({ id: i, method, params, sessionId }));
});
const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
await send('Page.enable', {}, sessionId);
await send('Runtime.enable', {}, sessionId);
await send('Log.enable', {}, sessionId);

const evalIn = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId)).result.value;
async function load(url) {
  await send('Page.navigate', { url }, sessionId);
  const t0 = Date.now();
  while (Date.now() - t0 < 300000) {
    if (await evalIn('document.title') === 'DONE') return JSON.parse(await evalIn("document.getElementById('out').textContent"));
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error('timed out waiting for ' + url);
}
const sep = base.includes('?') ? '&' : '?';
const list = await load(base + sep + 'list=1');
const out = { fontsOk: true, results: {}, errors };
for (const name of list.cases) {
  const r = await load(base + sep + 'style=' + encodeURIComponent(name));
  if (r.error) { out.error = r.error; break; }
  out.fontsOk = out.fontsOk && !!r.fontsOk;
  Object.assign(out.results, r.results);
}
await new Promise(r => process.stdout.write(JSON.stringify(out), r)); // flush before exit: a pipe truncates otherwise
ws.close();
cleanup();
process.exit(0);
