import { prisma } from '../../database/prisma.js';
import { AppError } from '../../utils/AppError.js';
import { addDays, localYmd } from '../../utils/dates.js';
import { CRISIS_RESPONSE } from '../../content/safety.js';
import { createAiProvider } from '../../ai/provider.js';
import { getUserTimezone } from '../user.service.js';
import { buildModelMessages } from './prompts.js';
import { isCrisisText, suggestionsFor } from './safety.js';

const DEFAULT_TITLE = 'New conversation';
// Only the most recent turns of this conversation are sent to the model.
const CONTEXT_TURNS = 12;
// Personalisation sends at most one coarse fact, and only when the user has opted in.
const PERSONAL_LOOKBACK_DAYS = 7;

const provider = createAiProvider();

const serializeMessage = (m) => ({
  id: m.id,
  role: m.role,
  content: m.content,
  modelName: m.modelName,
  createdAt: m.createdAt.toISOString(),
});

async function ownConversation(userId, id) {
  const conv = await prisma.aiConversation.findFirst({ where: { id, userId, deletedAt: null } });
  if (!conv) throw new AppError(404, 'NOT_FOUND', 'That conversation could not be found');
  return conv;
}

export async function createConversation(userId, title) {
  const conv = await prisma.aiConversation.create({
    data: { userId, title: title ?? DEFAULT_TITLE },
  });
  return { id: conv.id, title: conv.title, updatedAt: conv.updatedAt.toISOString(), messages: [] };
}

export async function listConversations(userId) {
  const rows = await prisma.aiConversation.findMany({
    where: { userId, deletedAt: null },
    orderBy: { updatedAt: 'desc' },
    take: 100,
    select: { id: true, title: true, updatedAt: true },
  });
  return rows.map((r) => ({ id: r.id, title: r.title, updatedAt: r.updatedAt.toISOString() }));
}

export async function getConversation(userId, id) {
  const conv = await ownConversation(userId, id);
  const messages = await prisma.aiMessage.findMany({
    where: { conversationId: conv.id, deletedAt: null },
    orderBy: { createdAt: 'asc' },
    take: 200,
  });
  return { id: conv.id, title: conv.title, updatedAt: conv.updatedAt.toISOString(), messages: messages.map(serializeMessage) };
}

export async function renameConversation(userId, id, title) {
  await ownConversation(userId, id);
  const conv = await prisma.aiConversation.update({ where: { id }, data: { title } });
  return { id: conv.id, title: conv.title };
}

export async function deleteConversation(userId, id) {
  await ownConversation(userId, id);
  // Soft delete keeps the row for a short window, and hides it from the user immediately.
  await prisma.aiConversation.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function deleteMessage(userId, messageId) {
  const msg = await prisma.aiMessage.findFirst({
    where: { id: messageId, deletedAt: null, conversation: { userId, deletedAt: null } },
  });
  if (!msg) throw new AppError(404, 'NOT_FOUND', 'That message could not be found');
  await prisma.aiMessage.update({ where: { id: messageId }, data: { deletedAt: new Date() } });
}

async function personalFactsFor(userId) {
  const prefs = await prisma.userPreference.findUnique({ where: { userId } });
  if (!prefs?.aiPersonalization) return [];

  const tz = await getUserTimezone(userId);
  const since = new Date(Date.now() - PERSONAL_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  const last = await prisma.moodEntry.findFirst({
    where: { userId, recordedAt: { gte: since } },
    orderBy: { recordedAt: 'desc' },
    select: { mood: true, recordedAt: true },
  });
  if (!last) return [];
  const day = localYmd(tz, last.recordedAt);
  const today = localYmd(tz);
  const when = day === today ? 'today' : day === addDays(today, -1) ? 'yesterday' : 'earlier this week';
  return [`The user recorded feeling ${last.mood.toLowerCase()} ${when}.`];
}

export async function sendMessage(userId, conversationId, content) {
  const conv = await ownConversation(userId, conversationId);

  // Safety comes first. Crisis messages get a fixed, reviewed reply and never reach the model.
  if (isCrisisText(content)) {
    const [userMessage, assistantMessage] = await prisma.$transaction([
      prisma.aiMessage.create({ data: { conversationId, role: 'USER', content } }),
      prisma.aiMessage.create({ data: { conversationId, role: 'ASSISTANT', content: CRISIS_RESPONSE, modelName: 'solace-safety-template' } }),
      prisma.aiConversation.update({ where: { id: conversationId }, data: { updatedAt: new Date(), title: conv.title === DEFAULT_TITLE ? titleFrom(content) : undefined } }),
    ]);
    return { userMessage: serializeMessage(userMessage), assistantMessage: serializeMessage(assistantMessage), crisis: true, suggestions: [] };
  }

  const userMessage = await prisma.aiMessage.create({ data: { conversationId, role: 'USER', content } });

  // The model only sees turns that existed before this message, plus this message.
  const recent = await prisma.aiMessage.findMany({
    where: { conversationId, deletedAt: null, id: { not: userMessage.id } },
    orderBy: { createdAt: 'desc' },
    take: CONTEXT_TURNS,
  });
  const history = [...recent].reverse().concat(userMessage);

  if (!provider) {
    throw new AppError(503, 'AI_UNAVAILABLE', 'Zen Monk is not configured on this server yet.');
  }

  const personalFacts = await personalFactsFor(userId);
  const messages = buildModelMessages({ history, personalFacts });

  // Errors are AppErrors from the provider; the user message is kept so the app can retry.
  const reply = await provider.chat(messages);

  const assistantMessage = await prisma.aiMessage.create({
    data: { conversationId, role: 'ASSISTANT', content: reply, modelName: provider.name },
  });
  await prisma.aiConversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date(), title: conv.title === DEFAULT_TITLE ? titleFrom(content) : undefined },
  });

  return {
    userMessage: serializeMessage(userMessage),
    assistantMessage: serializeMessage(assistantMessage),
    crisis: false,
    suggestions: suggestionsFor(content),
  };
}

function titleFrom(text) {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > 48 ? `${clean.slice(0, 45)}…` : clean;
}
