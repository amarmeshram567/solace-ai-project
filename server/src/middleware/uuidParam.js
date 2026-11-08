import { AppError } from '../utils/AppError.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Rejects malformed ids before they reach Postgres, so bad input yields 404, not 500.
export const uuidParam = (req, res, next, value) => {
  if (!UUID.test(value)) return next(new AppError(404, 'NOT_FOUND', 'That item could not be found'));
  return next();
};
