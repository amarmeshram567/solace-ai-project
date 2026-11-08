import { Router } from 'express';
import * as notifications from '../services/notification.service.js';
import { requireAuth } from '../middleware/auth.js';
import { uuidParam } from '../middleware/uuidParam.js';
import { validateBody } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  customReminderSchema,
  registerDeviceSchema,
  updatePreferencesSchema,
} from '../validators/phase5_6.validators.js';

export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);
notificationsRouter.param('id', uuidParam);

notificationsRouter.get(
  '/preferences',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await notifications.getPreferences(req.user.id) });
  }),
);

notificationsRouter.patch(
  '/preferences',
  validateBody(updatePreferencesSchema),
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await notifications.updateBuiltInPreferences(req.user.id, req.body.items) });
  }),
);

notificationsRouter.post(
  '/custom',
  validateBody(customReminderSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json({ success: true, data: await notifications.createCustomReminder(req.user.id, req.body) });
  }),
);

notificationsRouter.delete(
  '/custom/:id',
  asyncHandler(async (req, res) => {
    await notifications.deleteCustomReminder(req.user.id, req.params.id);
    res.json({ success: true, data: null });
  }),
);

notificationsRouter.post(
  '/devices',
  validateBody(registerDeviceSchema),
  asyncHandler(async (req, res) => {
    await notifications.registerDevice(req.user.id, req.body);
    res.status(204).end();
  }),
);

notificationsRouter.get(
  '/inbox',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await notifications.listInbox(req.user.id) });
  }),
);

notificationsRouter.post(
  '/inbox/:id/read',
  asyncHandler(async (req, res) => {
    await notifications.markRead(req.user.id, req.params.id);
    res.json({ success: true, data: null });
  }),
);
