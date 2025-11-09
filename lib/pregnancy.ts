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

  // Find the Monday of the week when pregnancy started (280 days before due date)
  const conceptionStart = due.minus({ days: GESTATION_DAYS });
  const pregnancyStartMonday = conceptionStart.startOf("week"); // Monday by default in Luxon

  // Find the most recent Monday (start of current pregnancy week)
  const currentMonday = now.startOf("week");

  // Calculate elapsed weeks from pregnancy start Monday to current Monday
  const elapsedWeeks = Math.floor(currentMonday.diff(pregnancyStartMonday, "weeks").weeks);
  const clampedWeeks = Math.min(40, Math.max(0, elapsedWeeks));

  // Calculate week (1-40) - week 0 becomes week 1
  const week = Math.min(40, Math.max(1, clampedWeeks + 1));

  // Days until due date (can be negative if past due)
  const daysUntilDue = Math.ceil(due.diff(now, "days").days);

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
