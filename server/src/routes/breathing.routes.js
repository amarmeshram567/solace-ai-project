import { Router } from 'express';
import * as breathing from '../services/breathing.service.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { breathingSessionSchema } from '../validators/phase3.validators.js';

export const breathingRouter = Router();
breathingRouter.use(requireAuth);

breathingRouter.post(
  '/sessions',
  validateBody(breathingSessionSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json({ success: true, data: await breathing.recordBreathingSession(req.user.id, req.body) });
  }),
);

breathingRouter.get(
  '/sessions',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await breathing.listBreathingSessions(req.user.id) });
  }),
);

breathingRouter.get(
  '/statistics',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await breathing.breathingStatistics(req.user.id) });
  }),
);
