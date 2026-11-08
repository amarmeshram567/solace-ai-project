import { Router } from 'express';
import * as homeService from '../services/home.service.js';
import * as affirmationService from '../services/affirmation.service.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validateBody } from '../middleware/validate.js';
import { z } from 'zod';

export const homeRouter = Router();
export const affirmationsRouter = Router();

homeRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await homeService.getHome(req.user.id) });
  }),
);

affirmationsRouter.use(requireAuth);

affirmationsRouter.get(
  '/daily',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await affirmationService.getDailyAffirmation(req.user.id) });
  }),
);

affirmationsRouter.post(
  '/daily/refresh',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await affirmationService.refreshDailyAffirmation(req.user.id) });
  }),
);

affirmationsRouter.post(
  '/daily/save',
  validateBody(z.object({ saved: z.boolean() }).strict()),
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      data: await affirmationService.setDailyAffirmationSaved(req.user.id, req.body.saved),
    });
  }),
);
