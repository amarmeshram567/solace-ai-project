import { Router } from 'express';
import * as wellness from '../services/wellness.service.js';
import { requireAuth } from '../middleware/auth.js';
import { uuidParam } from '../middleware/uuidParam.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { activityCategoryQuerySchema } from '../validators/phase3.validators.js';

export const wellnessRouter = Router();
wellnessRouter.use(requireAuth);
wellnessRouter.param('id', uuidParam);

wellnessRouter.get(
  '/resources',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await wellness.listResources() });
  }),
);

wellnessRouter.get(
  '/resources/:id',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await wellness.getResource(req.params.id) });
  }),
);

wellnessRouter.get(
  '/activities',
  asyncHandler(async (req, res) => {
    const q = activityCategoryQuerySchema.parse(req.query);
    res.json({ success: true, data: await wellness.listActivities(q.category) });
  }),
);

wellnessRouter.get(
  '/activities/:id',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await wellness.getActivity(req.params.id) });
  }),
);

wellnessRouter.post(
  '/activities/:id/complete',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await wellness.completeActivity(req.user.id, req.params.id) });
  }),
);
