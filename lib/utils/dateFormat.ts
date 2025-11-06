/**
 * Parse a date string (YYYY-MM-DD) as a local date to avoid timezone issues
 */
function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  // Create date in local timezone (month is 0-indexed in JS Date)
  return new Date(year, month - 1, day);
}

/**
 * Format a date in a human-readable way (e.g., "April 1st", "March 15th")
 * Accepts either a Date object or a date string (YYYY-MM-DD)
 */
export function formatHumanDate(date: Date | string): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // If it's a string, parse it as a local date to avoid timezone issues
  const dateObj = typeof date === 'string' ? parseLocalDate(date) : date;
  
  const day = dateObj.getDate();
  const month = months[dateObj.getMonth()];
  
  // Add ordinal suffix (st, nd, rd, th)
  let suffix = 'th';
  if (day % 10 === 1 && day % 100 !== 11) {
    suffix = 'st';
  } else if (day % 10 === 2 && day % 100 !== 12) {
    suffix = 'nd';
  } else if (day % 10 === 3 && day % 100 !== 13) {
    suffix = 'rd';
  }
  
  return `${month} ${day}${suffix}`;
}

