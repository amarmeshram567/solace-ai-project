import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

// Verifies the bearer access token and sets req.user. The user id always comes
// from the verified token — never from the request body, params, or query.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new AppError(401, 'UNAUTHORIZED', 'Please log in to continue'));
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] });
    req.user = { id: payload.sub };
    return next();
  } catch {
    return next(new AppError(401, 'TOKEN_INVALID', 'Your session has expired. Please log in again.'));
  }
}
