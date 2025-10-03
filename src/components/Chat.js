import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { addMessage } from '@/store/chatSlice';
import { setLoading, setOutput } from '@/store/testSlice';

// async function sendMessage(userMessage) {
//   const res = await fetch('/api/ask', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       messages: [{ role: 'user', content: userMessage }],
//     }),
//   });

//   const data = await res.json();
//   console.log('AI Response:', data);
// }

export default function Chat() {
  const dispatch = useDispatch();
  const messages = useSelector((s) => s.chat.messages);
  const mode = useSelector((s) => s.test.mode);

  const [url, setUrl] = useState('');
  const [scenario, setScenario] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;

    dispatch(
      addMessage({
        role: 'user',
        text: `Generate Playwright tests for ${url}\nScenario: ${
          scenario || '(none)'
        }`,
      })
    );
    dispatch(
      addMessage({
        role: 'system',
        text: `Generating Playwright tests for ${url}…`,
      })
    );
    dispatch(setLoading(true));

    // await sendMessage(scenario);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, scenario, mode }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        dispatch(
          addMessage({
            role: 'system',
            text: `Error: ${data.error || 'Unknown error'}`,
          })
        );
      } else {
        dispatch(
          addMessage({
            role: 'system',
            text: 'Tests generated and executed. See results below.',
          })
        );
        dispatch(
          setOutput({
            code: data.code,
            filePath: data.filePath,
            results: data.results,
          })
        );
      }
    } catch (err) {
      dispatch(
        addMessage({ role: 'system', text: `Request failed: ${String(err)}` })
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className='card space-y-4'>
      <div className='space-y-2 max-h-72 overflow-auto'>
        {messages.map((m) => (
          <div
            key={m.id}
            className={`w-full flex ${
              m.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] px-3 py-2 rounded-2xl border ${
                m.role === 'user'
                  ? 'bg-black text-white'
                  : 'bg-white text-black'
              }`}
            >
              <pre className='whitespace-pre-wrap text-sm'>{m.text}</pre>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} className='space-y-3'>
        <div className='grid grid-cols-1 gap-3'>
          <input
            className='input'
            type='url'
            required
            placeholder='https://example.com (required)'
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <textarea
            className='input'
            placeholder='Describe your testing scenario (optional)'
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
          />
        </div>
        <div className='flex items-center gap-3'>
          <button className='btn' type='submit'>
            Generate & Run
          </button>
          <span className='text-sm opacity-70'>
            Mode: <strong>{mode}</strong> (toggle on the page)
          </span>
        </div>
      </form>
    </div>
  );
}
