// app/components/CodeOutput.jsx (or wherever it lives)
'use client';

import { setOutput } from '../store/testSlice';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function CodeOutput() {
  const { code, filePath } = useSelector((s) => s.test);
  const dispatch = useDispatch();

  const [editableCode, setEditableCode] = useState(code);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setEditableCode(code || '');
  }, [code]);

  const isDirty = editableCode !== (code || '');

  const shortPath = useMemo(() => {
    if (!filePath) return '';
    // show end of path safely in the browser (no process.cwd() on client)
    const parts = filePath.split(/[/\\]+/);
    return parts.slice(Math.max(0, parts.length - 3)).join('/');
  }, [filePath]);

  const handleSave = useCallback(async () => {
    if (!filePath) {
      setMessage('No file path provided.');
      return false;
    }
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/save-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath, code: editableCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Save failed');
      dispatch(setOutput({ code: editableCode })); // keep store in sync
      setMessage('Saved ✓');
      return true;
    } catch (err) {
      setMessage(err?.message || 'Save failed');
      return false;
    } finally {
      setSaving(false);
    }
  }, [dispatch, editableCode, filePath]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setRunning(true);
    setMessage('');

    // If there are unsaved edits, save first before running
    if (isDirty) {
      const ok = await handleSave();
      if (!ok) {
        setRunning(false);
        return;
      }
    }

    try {
      const res = await fetch('/api/run-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath }),
      });
      const data = await res.json();
      if (data.ok) {
        dispatch(setOutput({ results: data?.results }));
        setMessage('Tests executed.');
      } else {
        setMessage(data?.error || 'Run failed');
      }
      // Optional: console logs for your existing debugging
      console.log('>>> filePath:', filePath);
      console.log('>>>> resultPlaywright:', data);
    } catch (err) {
      setMessage(err?.message || 'Run failed');
    } finally {
      setRunning(false);
    }
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(editableCode);
      setMessage('Copied to clipboard.');
    } catch {
      setMessage('Copy failed.');
    }
  };

  const onReset = () => {
    setEditableCode(code || '');
    setMessage('Reverted changes.');
  };

  const onKeyDown = (e) => {
    // Ctrl/Cmd + S to save
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  if (!code) return null;

  return (
    <div className='card space-y-2'>
      <div className='flex items-center justify-between'>
        <h3 className='font-semibold'>Generated Playwright Test</h3>
        <span
          className='text-xs opacity-70'
          title={
            filePath || 'src/generated/test-2025-10-16T06-02-41-585Z.spec.js'
          }
        >
          {shortPath}
        </span>
      </div>

      {/* Editable code area */}
      <label className='text-xs opacity-70'>Edit test code</label>
      <textarea
        value={editableCode}
        onChange={(e) => setEditableCode(e.target.value)}
        onKeyDown={onKeyDown}
        spellCheck={false}
        className='code font-mono text-sm whitespace-pre p-3 rounded border w-full min-h-[800px] bg-black text-white caret-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/20 border-white/20'
        aria-label='Playwright test code editor'
      />

      <form onSubmit={onSubmit}>
        <div className='flex flex-wrap items-center gap-3'>
          <button
            className='btn'
            type='button'
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : isDirty ? 'Save' : 'Saved ✓'}
          </button>

          <button className='btn' type='submit' disabled={running}>
            {running ? 'Running…' : 'Run'}
          </button>

          <button className='btn' type='button' onClick={onCopy}>
            Copy
          </button>

          <button
            className='btn'
            type='button'
            onClick={onReset}
            disabled={!isDirty}
            title={!isDirty ? 'No changes to reset' : 'Reset to last saved'}
          >
            Reset
          </button>

          {isDirty && (
            <span className='text-xs text-amber-600'>Unsaved changes</span>
          )}
          {!!message && <span className='text-xs opacity-70'>{message}</span>}
        </div>
      </form>
    </div>
  );
}
