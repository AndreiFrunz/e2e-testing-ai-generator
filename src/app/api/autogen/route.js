import { spawn } from 'child_process';
import path from 'path';
import { NextResponse } from 'next/server';
import { extractPlaywrightFile, savePlaywrightTest } from '../../../utils/file';

const backendPath = path.join(process.cwd(), '..', 'autogen', 'main.py');

export async function POST(req) {
  const { task } = await req.json();

  return new Promise((resolve) => {
    const py = spawn('python3', [backendPath, task]); // 👈 run AutoGen script
    let stdout = '';
    let stderr = '';

    py.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    py.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    py.on('close', (code) => {
      let playwrightCode = '';
      let filePath = '';
      if (code === 0) {
        playwrightCode = !!stdout ? extractPlaywrightFile(stdout) : '';
        filePath = !!playwrightCode ? savePlaywrightTest(playwrightCode) : '';

        resolve(
          NextResponse.json(
            {
              ok: true,
              code: playwrightCode,
              filePath,
              agentResponse: stdout,
            },
            { status: 200 }
          )
        );
      } else {
        resolve(
          NextResponse.json(
            { error: stderr || 'Python process failed.' },
            { status: 500 }
          )
        );
      }
    });
  });
}
