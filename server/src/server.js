import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './database/prisma.js';
import { startScheduler } from './services/notification.dispatch.js';

const app = createApp();

// Bind to all interfaces so the Android emulator (10.0.2.2) and physical
// devices on the same network can reach the API.
const server = app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`Solace API listening on http://0.0.0.0:${env.PORT}/api/v1`);
});

const stopScheduler = startScheduler();
if (stopScheduler) console.log('Reminder scheduler running');

async function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  stopScheduler?.();
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
