export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { generateMockPlaywrightTest } from '@/server/mock';
import { askAzureAgent } from '@/server/azureClient';
import { extractPlaywrightFile, savePlaywrightTest } from '@/utils/file';
import { runPlaywrightOnFile } from '@/server/runPlaywright';

export async function POST(req) {
  let resultPlayright, filePath, newThreadId, agentResponse;
  try {
    const body = await req.json();
    const { url, scenario, mode = 'mock', messages, threadId } = body || {};

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required.' }, { status: 400 });
    }

    let code = '';
    if (mode === 'azure') {
      const newMessage = messages?.length
        ? [...messages]
        : [{ role: 'user', content: 'hi' }];
      const azure = await askAzureAgent(newMessage, threadId);
      newThreadId = azure.threadId;
      agentResponse = azure.agentMessage[0].text.value;

      code = extractPlaywrightFile(agentResponse);
    } else {
      code = generateMockPlaywrightTest(url, scenario || '');
    }

    filePath = code ? savePlaywrightTest(code) : '';

    return NextResponse.json(
      { ok: true, code, filePath, resultPlayright, newThreadId, agentResponse },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
