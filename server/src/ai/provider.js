import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

/**
 * AI provider contract. Every provider implements:
 *   name: string
 *   health(): Promise<boolean>
 *   chat(messages, { signal }): Promise<string>
 *
 * messages: [{ role: 'system' | 'user' | 'assistant', content: string }]
 *
 * Providers must throw AppError(503, 'AI_UNAVAILABLE', ...) on any failure so the
 * chat route can show an honest message. They must never return canned text
 * as if it came from the model.
 */

const UNAVAILABLE = 'Zen Monk is unavailable right now. Please try again in a moment.';

export class OllamaProvider {
  constructor({ baseUrl, model }) {
    this.name = `ollama:${model}`;
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.model = model;
  }

  async health() {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, { signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  }

  async chat(messages, { signal } = {}) {
    let res;
    try {
      res = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          messages,
          stream: false,
          options: { temperature: 0.7, num_predict: 400 },
        }),
        signal: signal ?? AbortSignal.timeout(60_000),
      });
    } catch {
      throw new AppError(503, 'AI_UNAVAILABLE', UNAVAILABLE);
    }

    if (!res.ok) {
      throw new AppError(503, 'AI_UNAVAILABLE', UNAVAILABLE);
    }

    const json = await res.json();
    const content = json?.message?.content?.trim();
    if (!content) {
      throw new AppError(503, 'AI_UNAVAILABLE', UNAVAILABLE);
    }
    return content;
  }
}

export function createAiProvider() {
  if (env.AI_PROVIDER === 'disabled') {
    return null;
  }
  return new OllamaProvider({ baseUrl: env.OLLAMA_BASE_URL, model: env.OLLAMA_MODEL });
}
