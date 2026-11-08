import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useRemote } from '../../hooks/useRemote';
import { ApiError } from '../../services/api';

const DEFAULT_TITLE = 'New conversation';
const CHAT_RESPONSE_TIMEOUT_MS = 70_000;

const byRecent = (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt);

/**
 * Conversation state for Zen Monk.
 * - A conversation is created lazily on the first message, so tapping "New" never leaves empty ones behind.
 * - Failed sends keep the text so the user can retry without retyping.
 */
export function useChat() {
  const { authedRequest } = useAuth();
  const conversations = useRemote('/ai/conversations');

  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null); // { message, text }
  const [suggestions, setSuggestions] = useState([]);
  const initialised = useRef(false);

  // Open the most recent conversation once the list first loads.
  useEffect(() => {
    if (!initialised.current && conversations.data) {
      initialised.current = true;
      if (conversations.data.length) setActiveId(conversations.data.slice().sort(byRecent)[0].id);
    }
  }, [conversations.data]);

  // Load the selected thread.
  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return undefined;
    }
    let cancelled = false;
    setLoadingThread(true);
    setError(null);
    authedRequest(`/ai/conversations/${activeId}`)
      .then((c) => {
        if (!cancelled) setMessages(c.messages);
      })
      .catch((err) => {
        if (!cancelled) setError({ message: err.message, text: null });
      })
      .finally(() => {
        if (!cancelled) setLoadingThread(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeId, authedRequest]);

  const newConversation = useCallback(() => {
    setActiveId(null);
    setMessages([]);
    setSuggestions([]);
    setError(null);
  }, []);

  const select = useCallback((id) => {
    setSuggestions([]);
    setActiveId(id);
  }, []);

  const send = useCallback(
    async (raw) => {
      const text = raw.trim();
      if (!text || sending) return;

      setSending(true);
      setError(null);
      setSuggestions([]);
      const tempId = `tmp-${Date.now()}`;
      setMessages((m) => [...m, { id: tempId, role: 'USER', content: text, pending: true }]);

      try {
        let convId = activeId;
        if (!convId) {
          const created = await authedRequest('/ai/conversations', { method: 'POST', body: {} });
          convId = created.id;
          setActiveId(convId);
          conversations.setData((list) => [{ id: created.id, title: created.title, updatedAt: created.updatedAt }, ...(list ?? [])]);
        }

        const data = await authedRequest(`/ai/conversations/${convId}/messages`, {
          method: 'POST',
          body: { content: text },
          timeoutMs: CHAT_RESPONSE_TIMEOUT_MS,
        });

        setMessages((m) => [...m.filter((x) => x.id !== tempId), data.userMessage, data.assistantMessage]);
        setSuggestions(data.suggestions ?? []);

        const nowIso = new Date().toISOString();
        conversations.setData((list) =>
          (list ?? [])
            .map((c) => (c.id === convId ? { ...c, updatedAt: nowIso, title: c.title === DEFAULT_TITLE ? text.slice(0, 45) : c.title } : c))
            .sort(byRecent),
        );
      } catch (err) {
        setMessages((m) => m.map((x) => (x.id === tempId ? { ...x, pending: false, failed: true } : x)));
        setError({
          message: err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
          text,
        });
      } finally {
        setSending(false);
      }
    },
    [activeId, authedRequest, conversations, sending],
  );

  const retry = useCallback(() => {
    if (!error?.text) return;
    const text = error.text;
    setMessages((m) => m.filter((x) => !x.failed));
    setError(null);
    send(text);
  }, [error, send]);

  const rename = useCallback(
    async (id, title) => {
      const updated = await authedRequest(`/ai/conversations/${id}`, { method: 'PATCH', body: { title } });
      conversations.setData((list) => (list ?? []).map((c) => (c.id === id ? { ...c, title: updated.title } : c)));
    },
    [authedRequest, conversations],
  );

  const removeConversation = useCallback(
    async (id) => {
      await authedRequest(`/ai/conversations/${id}`, { method: 'DELETE' });
      conversations.setData((list) => (list ?? []).filter((c) => c.id !== id));
      if (activeId === id) newConversation();
    },
    [activeId, authedRequest, conversations, newConversation],
  );

  const removeMessage = useCallback(
    async (id) => {
      await authedRequest(`/ai/messages/${id}`, { method: 'DELETE' });
      setMessages((m) => m.filter((x) => x.id !== id));
    },
    [authedRequest],
  );

  return {
    conversations: conversations.data ?? [],
    conversationsStatus: conversations.status,
    conversationsError: conversations.error,
    reloadConversations: conversations.reload,
    activeId,
    messages,
    loadingThread,
    sending,
    error,
    suggestions,
    newConversation,
    select,
    send,
    retry,
    rename,
    removeConversation,
    removeMessage,
  };
}
