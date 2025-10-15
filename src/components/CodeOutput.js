'use client';
import { setOutput } from '@/store/testSlice';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function CodeOutput() {
  const { code, filePath } = useSelector((s) => s.test);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const onSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const res = await fetch('/api/run-tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath }),
    });
    const data = await res.json();
    if (data.ok) {
      dispatch(
        setOutput({
          results: data?.results,
        })
      );
    }
    console.log('>>> filePath:', filePath);
    console.log('>>>> resultPlayright:', data);
    setLoading(false);
  };

  if (!code) return null;
  return (
    <div className='card space-y-2'>
      <div className='flex items-center justify-between'>
        <h3 className='font-semibold'>Generated Playwright Test</h3>
        <span className='text-xs opacity-70'>
          {filePath?.replace(process.cwd(), '.')}
        </span>
      </div>
      <pre className='code text-sm'>
        <code>{code}</code>
      </pre>
      <form onSubmit={onSubmit}>
        <div className='flex items-center gap-3'>
          <button className='btn' type='submit' disabled={loading}>
            {!loading ? 'Run' : 'Running'}
          </button>
        </div>
      </form>
    </div>
  );
}
