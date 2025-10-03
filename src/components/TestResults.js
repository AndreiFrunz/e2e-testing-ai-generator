'use client';
import { useSelector } from 'react-redux';

export default function TestResults() {
  const { results, loading } = useSelector(s => s.test);
  if (loading) return <div className="card">Running tests…</div>;
  if (!results) return null;

  return (
    <div className="card space-y-3">
      <h3 className="font-semibold">Test Results</h3>
      <div className="text-sm">Passed: <strong>{results.passed}</strong> • Failed: <strong>{results.failed}</strong></div>
      {results.details?.length ? (
        <div className="space-y-2">
          {results.details.map((d, i) => (
            <div key={i} className="border rounded-xl p-2">
              <div className="text-sm"><strong>{d.title}</strong> — <span className={d.status === 'passed' ? 'text-green-600' : 'text-red-600'}>{d.status}</span></div>
              {d.error && <pre className="whitespace-pre-wrap text-xs mt-1">{d.error}</pre>}
            </div>
          ))}
        </div>
      ) : <div className="text-sm opacity-70">No details.</div>}
    </div>
  );
}
