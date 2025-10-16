// app/api/save-test/route.ts (or route.js)
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs'; // ensure Node fs is available

export async function POST(req) {
  try {
    const { filePath, code } = await req.json();

    if (typeof filePath !== 'string' || typeof code !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Invalid payload' },
        { status: 400 }
      );
    }

    // Prevent writing outside project root
    const projectRoot = path.resolve(process.cwd());
    const target = path.resolve(filePath);
    if (!target.startsWith(projectRoot + path.sep)) {
      return NextResponse.json(
        { ok: false, error: 'Path not allowed' },
        { status: 400 }
      );
    }

    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, code, 'utf8');

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Save failed' },
      { status: 500 }
    );
  }
}
