import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as chat from '../services/ai/chat.service.js';
import * as privacy from '../services/privacy.service.js';
import { requireAuth } from '../middleware/auth.js';
import { uuidParam } from '../middleware/uuidParam.js';
import { validateBody } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createConversationSchema,
  renameConversationSchema,
  sendMessageSchema,
} from '../validators/ai.validators.js';

export const aiRouter = Router();
aiRouter.use(requireAuth);
aiRouter.param('id', uuidParam);

// Per-user limit on messages to protect the self-hosted model. Keyed by user, not IP.
const messageLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  keyGenerator: (req) => req.user.id,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'You are sending messages quickly. Take a breath and try again shortly.' } },
});

aiRouter.post(
  '/conversations',
  validateBody(createConversationSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json({ success: true, data: await chat.createConversation(req.user.id, req.body.title) });
  }),
);

aiRouter.get(
  '/conversations',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await chat.listConversations(req.user.id) });
  }),
);

aiRouter.get(
  '/conversations/:id',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await chat.getConversation(req.user.id, req.params.id) });
  }),
);

aiRouter.patch(
  '/conversations/:id',
  validateBody(renameConversationSchema),
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await chat.renameConversation(req.user.id, req.params.id, req.body.title) });
  }),
);

aiRouter.delete(
  '/conversations/:id',
  asyncHandler(async (req, res) => {
    await chat.deleteConversation(req.user.id, req.params.id);
    res.json({ success: true, data: null });
  }),
);

// Clears every conversation for this user (soft delete, same as deleting one by one).
aiRouter.delete(
  '/conversations',
  asyncHandler(async (req, res) => {
    await privacy.clearAllConversations(req.user.id);
    res.json({ success: true, data: null });
  }),
);

aiRouter.post(
  '/conversations/:id/messages',
  messageLimiter,
  validateBody(sendMessageSchema),
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await chat.sendMessage(req.user.id, req.params.id, req.body.content) });
  }),
);

export const aiMessagesRouter = Router();
aiMessagesRouter.use(requireAuth);
aiMessagesRouter.param('id', uuidParam);

aiMessagesRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await chat.deleteMessage(req.user.id, req.params.id);
    res.json({ success: true, data: null });
  }),
);
