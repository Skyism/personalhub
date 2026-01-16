/**
 * Type representing a semi-annual wants budget period (H1 or H2).
 * Periods are either Jan-Jun (H1) or Jul-Dec (H2).
 */
export type WantsPeriod = {
  /** ISO date string in YYYY-MM-DD format for period start */
  periodStart: string;
  /** ISO date string in YYYY-MM-DD format for period end */
  periodEnd: string;
  /** Human-readable label like "H1 2026" or "H2 2026" */
  label: string;
};

/**
 * Gets the current semi-annual wants period based on a reference date.
 * Returns H1 (Jan-Jun) for months 0-5, H2 (Jul-Dec) for months 6-11.
 *
 * @param referenceDate - Date to determine the period for (defaults to current date)
 * @returns WantsPeriod object with start, end, and label
 *
 * @example
 * // For date in January through June
 * getCurrentWantsPeriod(new Date('2026-03-15'))
 * // Returns: { periodStart: '2026-01-01', periodEnd: '2026-06-30', label: 'H1 2026' }
 *
 * @example
 * // For date in July through December
 * getCurrentWantsPeriod(new Date('2026-09-20'))
 * // Returns: { periodStart: '2026-07-01', periodEnd: '2026-12-31', label: 'H2 2026' }
 */
export function getCurrentWantsPeriod(referenceDate: Date = new Date()): WantsPeriod {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth(); // 0-indexed (0 = January, 11 = December)

  if (month >= 0 && month <= 5) {
    // Jan-Jun (H1)
    return {
      periodStart: `${year}-01-01`,
      periodEnd: `${year}-06-30`,
      label: `H1 ${year}`,
    };
  } else {
    // Jul-Dec (H2)
    return {
      periodStart: `${year}-07-01`,
      periodEnd: `${year}-12-31`,
      label: `H2 ${year}`,
    };
  }
}

/**
 * Gets the wants period that contains a specific date.
 * Alias for getCurrentWantsPeriod for semantic clarity.
 *
 * @param date - Date to find the period for
 * @returns WantsPeriod object containing the date
 *
 * @example
 * getWantsPeriodForDate(new Date('2026-08-10'))
 * // Returns: { periodStart: '2026-07-01', periodEnd: '2026-12-31', label: 'H2 2026' }
 */
export function getWantsPeriodForDate(date: Date): WantsPeriod {
  return getCurrentWantsPeriod(date);
}

/**
 * Formats a period start date into a human-readable label.
 * Determines H1 or H2 based on the month of the period start date.
 *
 * @param periodStart - ISO date string in YYYY-MM-DD format (should be Jan 1 or Jul 1)
 * @returns Formatted label like "H1 2026" or "H2 2026"
 *
 * @example
 * formatPeriodLabel('2026-01-01')
 * // Returns: 'H1 2026'
 *
 * @example
 * formatPeriodLabel('2026-07-01')
 * // Returns: 'H2 2026'
 */
export function formatPeriodLabel(periodStart: string): string {
  const date = new Date(periodStart + 'T00:00:00');
  const year = date.getFullYear();
  const month = date.getMonth();
  return month === 0 ? `H1 ${year}` : `H2 ${year}`;
}

/**
 * Gets the exact start and end dates for a specific year and half.
 * Useful for creating new budget periods.
 *
 * @param year - Four-digit year (e.g., 2026)
 * @param half - 1 for H1 (Jan-Jun), 2 for H2 (Jul-Dec)
 * @returns Object with start and end date strings in YYYY-MM-DD format
 *
 * @example
 * getPeriodBounds(2026, 1)
 * // Returns: { start: '2026-01-01', end: '2026-06-30' }
 *
 * @example
 * getPeriodBounds(2026, 2)
 * // Returns: { start: '2026-07-01', end: '2026-12-31' }
 */
export function getPeriodBounds(year: number, half: 1 | 2): { start: string; end: string } {
  if (half === 1) {
    return { start: `${year}-01-01`, end: `${year}-06-30` };
  }
  return { start: `${year}-07-01`, end: `${year}-12-31` };
}
