/**
 * generateStudyPlan
 *
 * Pure function — no database or framework dependencies.
 * Takes a subject list, exam date, and daily available hours,
 * and returns an evenly distributed daily study schedule.
 *
 * @param {Object}   options
 * @param {string[]} options.subjects        – List of subject names
 * @param {string}   options.examDate        – Exam date (ISO string or any Date-parseable value)
 * @param {number}   options.dailyHours      – Hours available per day (e.g. 4)
 * @param {string}   [options.startDate]     – Optional start date (defaults to today)
 *
 * @returns {{ totalDays: number, dailyHours: number, perSubjectMinutesPerDay: number, plan: Object[] }}
 *
 * Each entry in `plan`:
 *   { date, day, sessions: [{ subject, startTime, endTime, durationMinutes }] }
 */
function generateStudyPlan({ subjects, examDate, dailyHours, startDate }) {
  // ── Validate inputs ──────────────────────────────────────
  if (!Array.isArray(subjects) || subjects.length === 0) {
    throw new Error('subjects must be a non-empty array of strings');
  }
  if (!examDate) {
    throw new Error('examDate is required');
  }
  if (typeof dailyHours !== 'number' || dailyHours <= 0 || dailyHours > 24) {
    throw new Error('dailyHours must be a number between 0 and 24');
  }

  const start = startDate ? new Date(startDate) : new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(examDate);
  end.setHours(0, 0, 0, 0);

  if (end <= start) {
    throw new Error('examDate must be after startDate');
  }

  // ── Calculate days available ─────────────────────────────
  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.ceil((end - start) / msPerDay);

  // ── Distribute subjects evenly across each day ───────────
  const totalMinutesPerDay = dailyHours * 60;
  const subjectCount = subjects.length;
  const perSubjectMinutes = Math.floor(totalMinutesPerDay / subjectCount);
  const remainderMinutes = totalMinutesPerDay - perSubjectMinutes * subjectCount;

  const plan = [];

  for (let d = 0; d < totalDays; d++) {
    const date = new Date(start);
    date.setDate(date.getDate() + d);

    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const dayLabel = `Day ${d + 1}`;

    // Build sessions for this day
    let currentOffset = 0; // running minutes offset from study-start
    const sessions = subjects.map((subject, i) => {
      // Give the first `remainderMinutes` subjects 1 extra minute each
      const duration = perSubjectMinutes + (i < remainderMinutes ? 1 : 0);
      const session = {
        subject,
        startTime: minutesToTime(currentOffset),
        endTime: minutesToTime(currentOffset + duration),
        durationMinutes: duration,
      };
      currentOffset += duration;
      return session;
    });

    plan.push({
      date: dateStr,
      day: dayLabel,
      sessions,
    });
  }

  return {
    totalDays,
    dailyHours,
    perSubjectMinutesPerDay: perSubjectMinutes,
    plan,
  };
}

/**
 * Convert a minutes offset into a readable "Xh Ym" label.
 * e.g. 90 → "1h 30m", 0 → "0h 0m"
 */
function minutesToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

module.exports = generateStudyPlan;
