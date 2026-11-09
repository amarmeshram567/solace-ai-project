import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';


const UNAVAILABLE = 'Zen Monk is unavailable right now. Please try again in a moment.';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export class GeminiProvider {
  constructor({ apiKey, model }) {
    this.name = `gemini:${model}`;
    this.apiKey = apiKey;
    this.model = model;
  }


  async health() {
    try {
      const res = await fetch(`${GEMINI_API_BASE}/${encodeURIComponent(this.model)}`, {
        headers: { 'x-goog-api-key': this.apiKey },
        signal: AbortSignal.timeout(3000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async chat(messages, { signal } = {}) {
    let res;
    try {
      const systemInstruction = messages
        .filter((message) => message.role === 'system')
        .map((message) => message.content)
        .join('\n\n');
      const contents = messages
        .filter((message) => message.role !== 'system')
        .map((message) => ({
          role: message.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: message.content }],
        }));

      res = await fetch(`${GEMINI_API_BASE}/${encodeURIComponent(this.model)}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': this.apiKey },
        body: JSON.stringify({
          ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {}),
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 400 },
        }),
        signal: signal ?? AbortSignal.timeout(60_000),
      });
    } catch {
      console.error('[ai:gemini] request failed before receiving a response');
      throw new AppError(503, 'AI_UNAVAILABLE', UNAVAILABLE);
    }

    if (!res.ok) {
      let upstreamDetails = '';
      try {
        const error = await res.json();
        const status = error?.error?.status;
        const message = error?.error?.message;
        if (typeof status === 'string') upstreamDetails += ` (${status})`;
        if (typeof message === 'string') upstreamDetails += `: ${message}`;
      } catch {
        // The HTTP status is still useful if Gemini returned a non-JSON response.
      }
      console.error(`[ai:gemini] request failed: HTTP ${res.status}${upstreamDetails}`);
      throw new AppError(503, 'AI_UNAVAILABLE', UNAVAILABLE);
    }

    let json;
    try {
      json = await res.json();
    } catch {
      console.error('[ai:gemini] response was not valid JSON');
      throw new AppError(503, 'AI_UNAVAILABLE', UNAVAILABLE);
    }
    const content = json?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .join('')
      .trim();
    if (!content) {
      const finishReason = json?.candidates?.[0]?.finishReason;
      const blockReason = json?.promptFeedback?.blockReason;
      console.error('[ai:gemini] response contained no text:', {
        ...(typeof finishReason === 'string' ? { finishReason } : {}),
        ...(typeof blockReason === 'string' ? { blockReason } : {}),
      });
      throw new AppError(503, 'AI_UNAVAILABLE', UNAVAILABLE);
    }
    return content;
  }
}

export function createAiProvider() {
  if (env.AI_PROVIDER === 'disabled') {
    return null;
  }
  return new GeminiProvider({ apiKey: env.GEMINI_API_KEY, model: env.GEMINI_MODEL });
}
