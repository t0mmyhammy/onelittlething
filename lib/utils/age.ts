/**
 * Calculate and format a child's age based on their birthdate
 * - If birthdate is in the future: shows countdown to due date
 * - Up to 2 years: shows months and years (e.g., "1 year, 3 months" or "8 months")
 * - After 2 years: shows years with half-year increments (e.g., "2.5 years", "3 years")
 */
/**
 * Parse a date string (YYYY-MM-DD) as a local date to avoid timezone issues
 */
function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  // Create date in local timezone (month is 0-indexed in JS Date)
  return new Date(year, month - 1, day);
}

export function calculateAge(birthdate: string | null): string | null {
  if (!birthdate) return null;

  const birth = parseLocalDate(birthdate);
  const now = new Date();

  // Normalize both dates to midnight for accurate comparison
  const birthMidnight = new Date(birth.getFullYear(), birth.getMonth(), birth.getDate());
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Check if the birthdate is in the future (baby not born yet)
  if (birthMidnight > todayMidnight) {
    // Calculate days until due date
    const diffTime = birthMidnight.getTime() - todayMidnight.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Due today!";
    } else if (diffDays === 1) {
      return "Due tomorrow";
    } else if (diffDays < 7) {
      return `${diffDays} days until due`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      const remainingDays = diffDays % 7;
      if (remainingDays === 0) {
        return `${weeks} week${weeks !== 1 ? 's' : ''} until due`;
      } else {
        return `${weeks} week${weeks !== 1 ? 's' : ''}, ${remainingDays} day${remainingDays !== 1 ? 's' : ''} until due`;
      }
    } else {
      const months = Math.floor(diffDays / 30);
      const remainingDays = diffDays % 30;
      if (remainingDays === 0) {
        return `${months} month${months !== 1 ? 's' : ''} until due`;
      } else if (remainingDays < 7) {
        return `${months} month${months !== 1 ? 's' : ''}, ${remainingDays} day${remainingDays !== 1 ? 's' : ''} until due`;
      } else {
        const weeks = Math.floor(remainingDays / 7);
        return `${months} month${months !== 1 ? 's' : ''}, ${weeks} week${weeks !== 1 ? 's' : ''} until due`;
      }
    }
  }
  
  // Calculate the difference for born children
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();

  // Adjust for negative months/days
  if (days < 0) {
    months--;
    const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += lastMonth.getDate();
  }
  
  if (months < 0) {
    years--;
    months += 12;
  }

  // For children under 2 years old, show months and years
  if (years < 2) {
    const totalMonths = years * 12 + months;
    
    if (totalMonths === 0) {
      // Less than 1 month old
      if (days < 7) {
        return `${days} day${days !== 1 ? 's' : ''}`;
      } else {
        const weeks = Math.floor(days / 7);
        return `${weeks} week${weeks !== 1 ? 's' : ''}`;
      }
    } else if (totalMonths < 12) {
      // Less than 1 year, show only months
      return `${totalMonths} month${totalMonths !== 1 ? 's' : ''}`;
    } else {
      // 1-2 years, show years and months
      const remainingMonths = totalMonths % 12;
      if (remainingMonths === 0) {
        return `${years} year${years !== 1 ? 's' : ''}`;
      } else {
        return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
      }
    }
  } else {
    // For children 2 years and older, show years with half-year precision
    const totalMonths = years * 12 + months;
    const yearsDecimal = totalMonths / 12;
    
    // Round to nearest 0.5
    const roundedYears = Math.round(yearsDecimal * 2) / 2;
    
    if (roundedYears % 1 === 0) {
      return `${roundedYears} year${roundedYears !== 1 ? 's' : ''}`;
    } else {
      return `${roundedYears} years`;
    }
  }
}

