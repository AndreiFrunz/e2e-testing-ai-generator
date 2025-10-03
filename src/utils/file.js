import fs from 'fs';
import path from 'path';

export function ensureGeneratedDir() {
  const dir = path.join(process.cwd(), 'src', 'generated');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function savePlaywrightTest(code) {
  const dir = ensureGeneratedDir();
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `test-${ts}.spec.js`;
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, code, 'utf-8');
  return filePath;
}
