'use client';
import Chat from '../components/Chat';
import CodeOutput from '../components/CodeOutput';
import TestResults from '../components/TestResults';
import { StoreProvider } from '../store';
import { useDispatch, useSelector } from 'react-redux';
import { setMode } from '../store/testSlice';

function ModeToggle() {
  const dispatch = useDispatch();
  const mode = useSelector((s) => s.test.mode);
  return (
    <div className='flex items-center gap-2'>
      <button
        className='btn'
        onClick={() => dispatch(setMode(mode === 'mock' ? 'azure' : 'mock'))}
      >
        Switch to {mode === 'mock' ? 'Azure' : 'Mock'} mode
      </button>
      <span className='text-sm opacity-70'>
        Uses environment variables when in Azure mode.
      </span>
    </div>
  );
}

export default function Page() {
  return (
    <StoreProvider>
      <main className='container space-y-10 py-12'>
        <section className='space-y-4'>
          <h1 className='text-3xl font-bold'>
            AI-powered End-to-End Test Generator
          </h1>
          <p className='text-sm opacity-80 max-w-2xl'>
            Provide a webpage URL and a testing scenario. I will generate a
            Playwright test using Autogen Ai. You can run, edit and save it.
          </p>
          {/* <ModeToggle /> */}
        </section>

        <section>
          <Chat />
        </section>

        <section className='grid gap-6'>
          <CodeOutput />
          <TestResults />
        </section>

        {/* <footer className="border-t pt-6 text-sm opacity-70">
          <div className="flex gap-6">
            <a className="underline" href="#">Docs</a>
            <a className="underline" href="#">Privacy</a>
            <a className="underline" href="#">Contact</a>
          </div>
        </footer> */}
      </main>
    </StoreProvider>
  );
}
