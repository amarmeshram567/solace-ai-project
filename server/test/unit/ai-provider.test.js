import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { GeminiProvider } from '../../src/ai/provider.js';
import { AppError } from '../../src/utils/AppError.js';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('GeminiProvider sends system instructions and maps assistant turns', async () => {
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, ...options };
    return {
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: [{ text: ' A kind reply. ' }] } }] }),
    };
  };

  const provider = new GeminiProvider({ apiKey: 'test-key', model: 'gemini-test' });
  const reply = await provider.chat([
    { role: 'system', content: 'Be supportive.' },
    { role: 'user', content: 'I feel low.' },
    { role: 'assistant', content: 'I am listening.' },
    { role: 'user', content: 'Thanks.' },
  ]);

  assert.equal(reply, 'A kind reply.');
  assert.match(request.url, /models\/gemini-test:generateContent$/);
  assert.equal(request.headers['x-goog-api-key'], 'test-key');
  assert.deepEqual(JSON.parse(request.body), {
    systemInstruction: { parts: [{ text: 'Be supportive.' }] },
    contents: [
      { role: 'user', parts: [{ text: 'I feel low.' }] },
      { role: 'model', parts: [{ text: 'I am listening.' }] },
      { role: 'user', parts: [{ text: 'Thanks.' }] },
    ],
    generationConfig: { temperature: 0.7, maxOutputTokens: 400 },
  });
});

test('GeminiProvider reports an unavailable error for unsuccessful responses', async () => {
  globalThis.fetch = async () => ({ ok: false });
  const provider = new GeminiProvider({ apiKey: 'test-key', model: 'gemini-test' });

  await assert.rejects(
    provider.chat([{ role: 'user', content: 'Hello.' }]),
    (error) => error instanceof AppError && error.status === 503 && error.code === 'AI_UNAVAILABLE',
  );
});
