import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

export function notFound(req, res) {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.originalUrl} was not found` },
  });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Some information is missing or invalid',
        details: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      },
    });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
  }

  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: { code: 'MALFORMED_JSON', message: 'Request body is not valid JSON' },
    });
  }

  if (err?.type === 'entity.too.large') {
    const isAvatarUpload = req.path === '/api/v1/users/me/avatar';
    return res.status(413).json({
      success: false,
      error: {
        code: isAvatarUpload ? 'AVATAR_TOO_LARGE' : 'REQUEST_TOO_LARGE',
        message: isAvatarUpload ? 'Profile photos must be 5 MB or smaller' : 'Request body is too large',
      },
    });
  }

  // Log server-side only. Do not echo internal details to the client.
  console.error('[unhandled]', err?.name, err?.code ?? '', err?.message ?? err);
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' },
  });
}
