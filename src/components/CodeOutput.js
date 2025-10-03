'use client';
import { useSelector } from 'react-redux';

export default function CodeOutput() {
  const { code, filePath } = useSelector(s => s.test);

  if (!code) return null;
  return (
    <div className="card space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Generated Playwright Test</h3>
        <span className="text-xs opacity-70">{filePath?.replace(process.cwd(), '.')}</span>
      </div>
      <pre className="code text-sm"><code>{code}</code></pre>
    </div>
  );
}
