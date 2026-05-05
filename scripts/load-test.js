#!/usr/bin/env node
// Usage: node scripts/load-test.js [concurrency] [base_url] [pdf_path]
// Example: node scripts/load-test.js 20 https://quoflow-schedule-demo-production-e783.up.railway.app /tmp/real_plan.pdf

const CONCURRENCY = parseInt(process.argv[2] || '10');
const BASE_URL = process.argv[3] || 'https://quoflow-schedule-demo-production-e783.up.railway.app';
const PDF_PATH = process.argv[4] || null;

const fs = require('fs');

async function runOne(id) {
  const start = Date.now();
  try {
    const pdfBytes = PDF_PATH ? fs.readFileSync(PDF_PATH) : Buffer.alloc(512, '%PDF-1.4');
    const fd = new FormData();
    fd.set('file', new Blob([pdfBytes], { type: 'application/pdf' }), 'test.pdf');

    const uploadRes = await fetch(`${BASE_URL}/api/upload`, { method: 'POST', body: fd });
    if (!uploadRes.ok) {
      console.log(`[${id}] UPLOAD FAILED ${uploadRes.status} (${Date.now()-start}ms)`);
      return { id, success: false, step: 'upload', ms: Date.now()-start };
    }
    const { fileUri } = await uploadRes.json();
    console.log(`[${id}] Upload OK (${Date.now()-start}ms)`);

    const extractRes = await fetch(`${BASE_URL}/api/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileUri, filename: 'test.pdf' }),
    });
    const ms = Date.now() - start;
    if (!extractRes.ok) {
      console.log(`[${id}] EXTRACT FAILED ${extractRes.status} (${ms}ms)`);
      return { id, success: false, step: 'extract', ms };
    }
    const data = await extractRes.json();
    console.log(`[${id}] Extract OK — ${data.doors?.length ?? 0} doors (${ms}ms)`);
    return { id, success: true, ms, doors: data.doors?.length ?? 0 };
  } catch (err) {
    const ms = Date.now() - start;
    console.log(`[${id}] ERROR: ${err.message} (${ms}ms)`);
    return { id, success: false, error: err.message, ms };
  }
}

async function main() {
  console.log(`\nQuoflow Load Test — ${CONCURRENCY} concurrent users\nTarget: ${BASE_URL}\n`);
  const start = Date.now();
  const results = await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => runOne(i + 1)));
  const total = Date.now() - start;
  const ok = results.filter(r => r.success);
  const fail = results.filter(r => !r.success);
  const avgMs = ok.length ? Math.round(ok.reduce((s, r) => s + r.ms, 0) / ok.length) : 0;
  const maxMs = ok.length ? Math.max(...ok.map(r => r.ms)) : 0;
  console.log(`\n── Results ──────────────────`);
  console.log(`Successful:  ${ok.length}/${CONCURRENCY}`);
  console.log(`Failed:      ${fail.length}/${CONCURRENCY}`);
  console.log(`Total time:  ${total}ms`);
  console.log(`Avg latency: ${avgMs}ms`);
  console.log(`Max latency: ${maxMs}ms`);
  if (fail.length) console.log(`Failures:`, fail.map(r => `[${r.id}] ${r.step || r.error}`).join(', '));
}

main().catch(console.error);
