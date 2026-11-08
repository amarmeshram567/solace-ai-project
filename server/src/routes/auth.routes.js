import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authService from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  resetPasswordSchema,
  signupSchema,
} from '../validators/auth.validators.js';

export const authRouter = Router();

// Stricter limit on credential endpoints to slow brute-force attempts.
const credentialLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please wait a few minutes.' } },
});

authRouter.post(
  '/signup',
  credentialLimiter,
  validateBody(signupSchema),
  asyncHandler(async (req, res) => {
    const data = await authService.signup(req.body);
    res.status(201).json({ success: true, data });
  }),
);

authRouter.post(
  '/login',
  credentialLimiter,
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const data = await authService.login(req.body);
    res.json({ success: true, data });
  }),
);

authRouter.post(
  '/refresh',
  validateBody(refreshSchema),
  asyncHandler(async (req, res) => {
    const data = await authService.refresh(req.body.refreshToken);
    res.json({ success: true, data });
  }),
);

authRouter.post(
  '/logout',
  validateBody(refreshSchema),
  asyncHandler(async (req, res) => {
    await authService.logout(req.body.refreshToken);
    res.json({ success: true, data: null });
  }),
);

authRouter.post(
  '/forgot-password',
  credentialLimiter,
  validateBody(forgotPasswordSchema),
  asyncHandler(async (req, res) => {
    await authService.requestPasswordReset(req.body.email);
    // Same response for every email, registered or not.
    res.json({
      success: true,
      data: { message: 'If an account exists for that email, reset instructions are on their way.' },
    });
  }),
);

authRouter.post(
  '/reset-password',
  credentialLimiter,
  validateBody(resetPasswordSchema),
  asyncHandler(async (req, res) => {
    await authService.resetPassword({ token: req.body.token, password: req.body.password });
    res.json({ success: true, data: null });
  }),
);

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = await authService.getCurrentUser(req.user.id);
    res.json({ success: true, data });
  }),
);
