import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  // Optional body: { filePath?: string }
  let filePath;
  try {
    const body = await req.json();
    filePath = body?.filePath || undefined;
  } catch {
    // no body / invalid JSON — run full suite
  }

  // Build command
  const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const args = ['-y', 'playwright', 'test', '--reporter=json'];
  if (filePath) args.push(filePath);

  // Write JSON to a temp file to avoid stdout pollution
  const outFile = path.join(os.tmpdir(), `pw-results-${Date.now()}.json`);

  // Helper: map Playwright test object to a final human status
  const toFinalStatus = (test) => {
    // Use roll-up first
    if (test?.status === 'expected') return 'passed';
    if (test?.status === 'unexpected') return 'failed';
    if (test?.status === 'skipped') return 'skipped';

    // Fallback: last attempt
    const attempts = test?.results || [];
    const last = attempts[attempts.length - 1] || {};
    return last.status || last.outcome || 'unknown';
  };

  // Run Playwright
  return await new Promise((resolve) => {
    const child = spawn(cmd, args, {
      cwd: process.cwd(),
      env: {
        ...process.env,
        CI: '1',
        FORCE_COLOR: '0',
        PLAYWRIGHT_JSON_OUTPUT_FILE: outFile, // <- ensure JSON goes to file
        PLAYWRIGHT_FORCE_TTY: '0', // be extra-safe for CI output
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stderr = '';
    child.stderr.on('data', (d) => (stderr += d.toString()));

    child.on('error', (err) => {
      return resolve(
        NextResponse.json(
          {
            ok: false,
            results: { passed: 0, failed: 0, details: [], raw: { stderr } },
            error: err?.message ?? String(err),
          },
          { status: 500 }
        )
      );
    });

    child.on('close', async (code) => {
      // Read the JSON file that Playwright produced
      let report;
      try {
        const buf = await fs.readFile(outFile, 'utf8');
        report = JSON.parse(buf || '{}');
      } catch (e) {
        return resolve(
          NextResponse.json(
            {
              ok: false,
              results: {
                passed: 0,
                failed: 0,
                details: [],
                raw: { exitCode: code, stderr },
              },
              error: `Failed to read/parse Playwright JSON: ${e?.message || e}`,
            },
            { status: 500 }
          )
        );
      } finally {
        // best-effort cleanup
        try {
          await fs.unlink(outFile);
        } catch {}
      }

      // Traverse suites/specs/tests
      let passed = 0;
      let failed = 0;
      const details = [];

      const stack = [];
      if (report?.suites?.length) stack.push(...report.suites);

      while (stack.length) {
        const s = stack.pop();
        if (s?.suites?.length) stack.push(...s.suites);
        if (s?.specs?.length) {
          for (const spec of s.specs) {
            for (const test of spec.tests || []) {
              const status = toFinalStatus(test);

              if (status === 'passed') passed += 1;
              else if (status === 'skipped') {
                // skip from totals
              } else failed += 1;

              // Last attempt for error detail, regardless of pass/fail
              const attempts = test.results || [];
              const last = attempts[attempts.length - 1] || {};
              const errorsArr = last.errors || (last.error ? [last.error] : []);
              const firstErr = errorsArr?.[0] || {};
              const errorMsg = firstErr.message || firstErr.stack || null;

              details.push({
                title: spec.title,
                project: test.projectName,
                file: spec.file,
                status,
                duration: last.duration,
                error: errorMsg,
              });
            }
          }
        }
      }

      return resolve(
        NextResponse.json(
          {
            ok: true,
            results: {
              passed,
              failed,
              details,
              raw: { exitCode: code, stderr },
            },
          },
          { status: 200 }
        )
      );
    });
  });
}
