import { Router } from 'express';
import * as assessments from '../services/assessment.service.js';
import { requireAuth } from '../middleware/auth.js';
import { uuidParam } from '../middleware/uuidParam.js';
import { validateBody } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { assessmentSubmitSchema } from '../validators/phase3.validators.js';

export const assessmentsRouter = Router();
assessmentsRouter.use(requireAuth);
assessmentsRouter.param('id', uuidParam);

assessmentsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await assessments.listAssessments() });
  }),
);

assessmentsRouter.get(
  '/history',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await assessments.assessmentHistory(req.user.id) });
  }),
);

assessmentsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await assessments.getAssessment(req.params.id) });
  }),
);

assessmentsRouter.post(
  '/:id/submit',
  validateBody(assessmentSubmitSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json({ success: true, data: await assessments.submitAssessment(req.user.id, req.params.id, req.body.answers) });
  }),
);
