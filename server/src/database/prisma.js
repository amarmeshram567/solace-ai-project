import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';

// One client per process. Logging is limited to warnings and errors so that
// query parameters (which can contain personal wellness data) are not logged.
export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});
