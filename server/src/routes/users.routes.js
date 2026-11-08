import { Router } from 'express';
import * as userService from '../services/user.service.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validateBody } from '../middleware/validate.js';
import {
  changePasswordSchema,
  updateAvatarSchema,
  updateProfileSchema,
} from '../validators/user.validators.js';
import { userPreferencesSchema, deleteAccountSchema } from '../validators/phase5_6.validators.js';
import * as privacy from '../services/privacy.service.js';
import * as authService from '../services/auth.service.js';
import rateLimit from 'express-rate-limit';
import { AppError } from '../utils/AppError.js';
import {
  detectAvatarMimeType,
  MAX_AVATAR_BASE64_LENGTH,
  MAX_AVATAR_BYTES,
} from '../utils/avatar.js';

export const usersRouter = Router();

usersRouter.use(requireAuth);

const avatarUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

function validateAvatarSize(req, res, next) {
  if (typeof req.body?.image === 'string' && req.body.image.length > MAX_AVATAR_BASE64_LENGTH) {
    return next(new AppError(413, 'AVATAR_TOO_LARGE', 'Profile photos must be 5 MB or smaller'));
  }
  return next();
}

usersRouter.patch(
  '/me',
  validateBody(updateProfileSchema),
  asyncHandler(async (req, res) => {
    // The user is always taken from the verified token, never from the body.
    const data = await userService.updateProfile(req.user.id, req.body);
    res.json({ success: true, data });
  }),
);

usersRouter.patch(
  '/me/password',
  validateBody(changePasswordSchema),
  asyncHandler(async (req, res) => {
    await authService.changePassword(req.user.id, req.body);
    res.json({ success: true, data: null });
  }),
);

usersRouter.get(
  '/me/avatar',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await userService.getAvatar(req.user.id) });
  }),
);

usersRouter.post(
  '/me/avatar',
  avatarUploadLimiter,
  validateAvatarSize,
  validateBody(updateAvatarSchema),
  asyncHandler(async (req, res) => {
    const file = Buffer.from(req.body.image, 'base64');
    if (!file.length) throw new AppError(400, 'AVATAR_REQUIRED', 'Choose a profile photo to upload');
    if (file.length > MAX_AVATAR_BYTES) {
      throw new AppError(413, 'AVATAR_TOO_LARGE', 'Profile photos must be 5 MB or smaller');
    }
    const detectedMimeType = detectAvatarMimeType(file);
    if (!detectedMimeType) {
      throw new AppError(415, 'AVATAR_TYPE_INVALID', 'Use a JPEG, PNG, or WebP image');
    }
    const data = await userService.updateAvatar(req.user.id, file, detectedMimeType);
    res.json({ success: true, data });
  }),
);

usersRouter.get(
  '/me/preferences',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await privacy.getUserPreferences(req.user.id) });
  }),
);

usersRouter.patch(
  '/me/preferences',
  validateBody(userPreferencesSchema),
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await privacy.updateUserPreferences(req.user.id, req.body) });
  }),
);

usersRouter.get(
  '/me/export',
  asyncHandler(async (req, res) => {
    const data = await privacy.exportUserData(req.user.id);
    res.setHeader('Content-Disposition', 'attachment; filename="solace-export.json"');
    res.json({ success: true, data });
  }),
);

usersRouter.delete(
  '/me',
  validateBody(deleteAccountSchema),
  asyncHandler(async (req, res) => {
    await privacy.deleteAccount(req.user.id, req.body.password);
    res.json({ success: true, data: null });
  }),
);
