import { Router } from 'express';
import * as therapists from '../services/therapist.service.js';
import { uuidParam } from '../middleware/uuidParam.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { therapistQuerySchema } from '../validators/phase5_6.validators.js';

// Public directory: no sign-in needed to browse. Listings are reference data only.
export const therapistsRouter = Router();
therapistsRouter.param('id', uuidParam);

therapistsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = therapistQuerySchema.parse(req.query);
    res.json({
      success: true,
      data: await therapists.searchTherapists({
        q: q.q,
        city: q.city,
        verifiedOnly: q.verified,
        limit: q.limit,
        offset: q.offset,
      }),
    });
  }),
);

therapistsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await therapists.getTherapist(req.params.id) });
  }),
);
