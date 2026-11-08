// Calendar-date helpers. All "day" logic (streaks, daily affirmation) uses the user's
// own timezone so a day means the user's day, not the server's.

export function isValidTimeZone(tz) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

// en-CA formats as YYYY-MM-DD, which is what we store and compare.
export function localYmd(timeZone, date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function addDays(ymd, days) {
  const d = new Date(`${ymd}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function startOfLocalDay(timeZone, ymd) {
  const [year, month, day] = ymd.split('-').map(Number);
  const targetUtc = Date.UTC(year, month - 1, day);
  let timestamp = targetUtc;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date(timestamp));
    const value = (type) => Number(parts.find((part) => part.type === type)?.value);
    const localAsUtc = Date.UTC(
      value('year'),
      value('month') - 1,
      value('day'),
      value('hour'),
      value('minute'),
      value('second'),
    );
    const correction = targetUtc - localAsUtc;
    timestamp += correction;
    if (correction === 0) break;
  }

  return new Date(timestamp);
}

// Prisma @db.Date columns are stored as UTC midnight of the calendar date.
export function ymdToDbDate(ymd) {
  return new Date(`${ymd}T00:00:00.000Z`);
}

export function dbDateToYmd(date) {
  return date.toISOString().slice(0, 10);
}

// Local calendar parts for a timezone. weekdayIdx: 0 = Monday … 6 = Sunday (matches daysMask bits).
export function localParts(timeZone, date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    weekday: 'short',
  }).formatToParts(date);
  const get = (t) => parts.find((p) => p.type === t)?.value;
  const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return {
    ymd: `${get('year')}-${get('month')}-${get('day')}`,
    hhmm: `${get('hour')}:${get('minute')}`,
    weekdayIdx: WEEKDAYS.indexOf(get('weekday')),
  };
}
