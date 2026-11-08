import { env } from '../config/env.js';

// Delivery boundary for transactional email. Phase 2 ships a console adapter for
// development. For production, implement sendMail() with your provider (e.g. SMTP,
// Postmark, SES) and keep the same signature; config already blocks "console" in production.
export async function sendPasswordResetEmail({ to, token }) {
  if (env.EMAIL_DELIVERY === 'disabled') {
    return;
  }
  // Development only: the code is printed to the server terminal so the flow can be
  // tested end to end without a mail provider. It is never returned in an API response.
  console.log(`[dev-email] password reset code for ${to}: ${token} (expires in 30 minutes)`);
}
