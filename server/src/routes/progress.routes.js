import { Router } from 'express';
import * as progress from '../services/progress.service.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { progressQuerySchema } from '../validators/phase5_6.validators.js';

export const progressRouter = Router();
progressRouter.use(requireAuth);

progressRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = progressQuerySchema.parse(req.query);
    res.json({ success: true, data: await progress.getProgress(req.user.id, q.range) });
  }),
);

progressRouter.get(
  '/xp',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await progress.getXpSummary(req.user.id) });
  }),
);

progressRouter.get(
  '/streaks',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await progress.getStreaks(req.user.id) });
  }),
);

progressRouter.get(
  '/achievements',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await progress.getAchievements(req.user.id) });
  }),
);
