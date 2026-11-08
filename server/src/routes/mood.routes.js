import { Router } from 'express';
import * as mood from '../services/mood.service.js';
import { requireAuth } from '../middleware/auth.js';
import { uuidParam } from '../middleware/uuidParam.js';
import { validateBody } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createMoodSchema,
  moodAnalyticsQuerySchema,
  moodListQuerySchema,
  updateMoodSchema,
} from '../validators/phase3.validators.js';

export const moodRouter = Router();
moodRouter.use(requireAuth);
moodRouter.param('id', uuidParam);

moodRouter.post(
  '/',
  validateBody(createMoodSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json({ success: true, data: await mood.createMoodEntry(req.user.id, req.body) });
  }),
);

moodRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = moodListQuerySchema.parse(req.query);
    res.json({ success: true, data: await mood.listMoodEntries(req.user.id, q) });
  }),
);

moodRouter.get(
  '/analytics',
  asyncHandler(async (req, res) => {
    const q = moodAnalyticsQuerySchema.parse(req.query);
    res.json({ success: true, data: await mood.moodAnalytics(req.user.id, q.range) });
  }),
);

moodRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await mood.getMoodEntry(req.user.id, req.params.id) });
  }),
);

moodRouter.patch(
  '/:id',
  validateBody(updateMoodSchema),
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await mood.updateMoodEntry(req.user.id, req.params.id, req.body) });
  }),
);

moodRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await mood.deleteMoodEntry(req.user.id, req.params.id);
    res.json({ success: true, data: null });
  }),
);
