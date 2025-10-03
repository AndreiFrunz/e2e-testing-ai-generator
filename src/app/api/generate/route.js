export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { generateMockPlaywrightTest } from '@/server/mock';
import { askAzureAgent } from '@/server/azureClient';
import { savePlaywrightTest } from '@/utils/file';
import { runPlaywrightOnFile } from '@/server/runPlaywright';

export async function POST(req) {
  try {
    const body = await req.json();
    const { url, scenario, mode = 'mock' } = body || {};

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required.' }, { status: 400 });
    }

    let code = '';
    if (mode === 'azure') {
      const azure = await askAzureAgent(url, scenario || '');
      code = azure.code;
    } else {
      code = generateMockPlaywrightTest(url, scenario || '');
    }

    const filePath = savePlaywrightTest(code);

    // Execute Playwright tests
    const results = await runPlaywrightOnFile(filePath);

    return NextResponse.json(
      { ok: true, code, filePath, results },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
