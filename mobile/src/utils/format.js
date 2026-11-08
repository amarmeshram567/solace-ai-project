const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Greeting uses the user's timezone when the runtime supports it, else the device clock.
export function greetingFor(timeZone) {
  let hour = new Date().getHours();
  try {
    const parts = new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone }).formatToParts(new Date());
    hour = Number(parts.find((p) => p.type === 'hour')?.value ?? hour) % 24;
  } catch {
    // Keep device hour.
  }
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// "Thursday, 5 November" — built manually so it does not depend on runtime locale support.
export function longDate(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  const weekday = DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${weekday}, ${d} ${MONTHS[m - 1]}`;
}

export function firstName(fullName) {
  return (fullName ?? '').trim().split(/\s+/)[0] || 'friend';
}

// Pulls per-field messages from a ValidationError response for form display.
export function fieldErrorsFrom(err) {
  const out = {};
  for (const d of err?.details ?? []) {
    if (d.field && !out[d.field]) out[d.field] = d.message;
  }
  return out;
}

export function deviceTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  } catch {
    return 'Asia/Kolkata';
  }
}
