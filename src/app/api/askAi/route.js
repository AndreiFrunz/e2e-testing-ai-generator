import { NextResponse } from 'next/server';
import { askAzureAI } from '@/server/azureClient';

export async function POST(req) {
  const { messages } = await req.json();

  try {
    const result = await askAzureAI(messages);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
