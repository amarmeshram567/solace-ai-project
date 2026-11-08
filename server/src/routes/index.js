import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { usersRouter } from './users.routes.js';
import { homeRouter, affirmationsRouter } from './home.routes.js';
import { moodRouter } from './mood.routes.js';
import { assessmentsRouter } from './assessments.routes.js';
import { breathingRouter } from './breathing.routes.js';
import { wellnessRouter } from './wellness.routes.js';
import { aiRouter, aiMessagesRouter } from './ai.routes.js';
import { progressRouter } from './progress.routes.js';
import { notificationsRouter } from './notifications.routes.js';
import { therapistsRouter } from './therapists.routes.js';

export const apiRouter = Router();

apiRouter.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', time: new Date().toISOString() } });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/home', homeRouter);
apiRouter.use('/affirmations', affirmationsRouter);
apiRouter.use('/moods', moodRouter);
apiRouter.use('/assessments', assessmentsRouter);
apiRouter.use('/breathing', breathingRouter);
apiRouter.use('/wellness', wellnessRouter);
apiRouter.use('/ai', aiRouter);
apiRouter.use('/ai/messages', aiMessagesRouter);
apiRouter.use('/progress', progressRouter);
apiRouter.use('/notifications', notificationsRouter);
apiRouter.use('/therapists', therapistsRouter);
