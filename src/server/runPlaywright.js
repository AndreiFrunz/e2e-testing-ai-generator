import { spawn } from 'child_process';
import path from 'path';

/**
 * Runs Playwright tests programmatically by spawning the CLI with JSON reporter.
 * Returns a normalized summary: { passed, failed, details: [{title, status, error}] }
 */
export function runPlaywrightOnFile(filePath) {
  return new Promise((resolve) => {
    const args = ['playwright', 'test', filePath, '--reporter=json'];
    const child = spawn('npx', args, { shell: true, env: { ...process.env, CI: '1' } });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => (stdout += d.toString()));
    child.stderr.on('data', (d) => (stderr += d.toString()));

    child.on('close', (code) => {
      let report = null;
      try {
        report = JSON.parse(stdout || '{}');
      } catch (e) {
        // If JSON parse failed, include raw output.
        resolve({
          passed: 0,
          failed: 0,
          details: [],
          raw: { stdout, stderr, exitCode: code }
        });
        return;
      }

      // Normalize report
      let passed = 0;
      let failed = 0;
      const details = [];

      if (report && report.suites) {
        const stack = [...report.suites];
        while (stack.length) {
          const s = stack.pop();
          if (s?.suites) stack.push(...s.suites);
          if (s?.specs) {
            for (const spec of s.specs) {
              for (const test of spec.tests || []) {
                const status = test.results?.[0]?.status || 'unknown';
                if (status === 'passed') passed += 1;
                else failed += 1;
                const error = test.results?.[0]?.error?.message || null;
                details.push({ title: spec.title, status, error });
              }
            }
          }
        }
      }

      resolve({ passed, failed, details, raw: { exitCode: code } });
    });
  });
}
