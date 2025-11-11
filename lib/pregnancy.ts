import { DateTime } from "luxon";

const GESTATION_DAYS = 280;
const TERM_WEEKS = 37; // Full term is 37 weeks

export function getNowDetroit(): DateTime {
  return DateTime.now().setZone("America/Detroit");
}

export type PregnancyStatus = "pre" | "normal" | "term" | "post";

export interface PregnancyMeta {
  week: number;
  daysUntilDue: number;
  weeksUntilDue: number;
  pctComplete: number;
  status: PregnancyStatus;
}

export function calcFromDueDate(dueISO: string): PregnancyMeta {
  const now = getNowDetroit().startOf("day");
  const due = DateTime.fromISO(dueISO, { zone: "America/Detroit" }).endOf("day");

  // Days until due date (can be negative if past due)
  const daysUntilDue = Math.ceil(due.diff(now, "days").days);

  // Calculate days elapsed in pregnancy (280 days total - days until due)
  const daysElapsed = GESTATION_DAYS - daysUntilDue;

  // Calculate current week by rounding down (floor)
  // Week changes only when you enter the new week (e.g., Week 20 starts on day 140, not day 133)
  // Clamp between 1 and 40
  const week = Math.min(40, Math.max(1, Math.floor(daysElapsed / 7)));

  // For percentage calculation, use actual elapsed weeks (can include partial week)
  const elapsedWeeks = daysElapsed / 7;
  const clampedWeeks = Math.min(40, Math.max(0, elapsedWeeks));

  // Weeks until due date (based on actual calendar weeks remaining)
  const weeksUntilDue = Math.ceil(daysUntilDue / 7);

  // Percentage complete based on 37 weeks (term) not 40
  const pctComplete = Math.min(100, Math.max(0, +(clampedWeeks / TERM_WEEKS * 100).toFixed(1)));

  // Status: pre (before week 4), normal (weeks 4-36), term (weeks 37-40), post (after due date)
  let status: PregnancyStatus;
  if (daysUntilDue <= 0) {
    status = "post";
  } else if (week < 4) {
    status = "pre";
  } else if (week >= TERM_WEEKS) {
    status = "term";
  } else {
    status = "normal";
  }

  return { week, daysUntilDue, weeksUntilDue, pctComplete, status };
}

export function validateDueDate(dateString: string): boolean {
  const date = DateTime.fromISO(dateString);
  if (!date.isValid) return false;

  const now = getNowDetroit();
  const diffDays = date.diff(now, "days").days;

  // Due date should be within reasonable range:
  // - Not more than 280 days in the past (full term)
  // - Not more than 280 days in the future
  return diffDays >= -GESTATION_DAYS && diffDays <= GESTATION_DAYS;
}
