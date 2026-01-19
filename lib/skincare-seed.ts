// Sample routine structure for testing and UI development reference
// This demonstrates the data structure for skincare_routines table
// NOT automatically inserted - users create their own routines

export const sampleRoutines = [
  // Monday
  {
    day_of_week: 1,
    time_of_day: 'morning',
    steps: [
      { id: crypto.randomUUID(), order: 1, text: 'Cleanser' },
      { id: crypto.randomUUID(), order: 2, text: 'Toner' },
      { id: crypto.randomUUID(), order: 3, text: 'Vitamin C Serum' },
      { id: crypto.randomUUID(), order: 4, text: 'Moisturizer' },
      { id: crypto.randomUUID(), order: 5, text: 'Sunscreen SPF 50' }
    ]
  },
  {
    day_of_week: 1,
    time_of_day: 'night',
    steps: [
      { id: crypto.randomUUID(), order: 1, text: 'Oil Cleanser' },
      { id: crypto.randomUUID(), order: 2, text: 'Water-based Cleanser' },
      { id: crypto.randomUUID(), order: 3, text: 'Toner' },
      { id: crypto.randomUUID(), order: 4, text: 'Retinol Serum' },
      { id: crypto.randomUUID(), order: 5, text: 'Night Cream' }
    ]
  },
  // Tuesday
  {
    day_of_week: 2,
    time_of_day: 'morning',
    steps: [
      { id: crypto.randomUUID(), order: 1, text: 'Cleanser' },
      { id: crypto.randomUUID(), order: 2, text: 'Hyaluronic Acid Serum' },
      { id: crypto.randomUUID(), order: 3, text: 'Moisturizer' },
      { id: crypto.randomUUID(), order: 4, text: 'Sunscreen SPF 50' }
    ]
  },
  {
    day_of_week: 2,
    time_of_day: 'night',
    steps: [
      { id: crypto.randomUUID(), order: 1, text: 'Oil Cleanser' },
      { id: crypto.randomUUID(), order: 2, text: 'Water-based Cleanser' },
      { id: crypto.randomUUID(), order: 3, text: 'Niacinamide Serum' },
      { id: crypto.randomUUID(), order: 4, text: 'Night Cream' }
    ]
  },
  // Wednesday
  {
    day_of_week: 3,
    time_of_day: 'morning',
    steps: [
      { id: crypto.randomUUID(), order: 1, text: 'Cleanser' },
      { id: crypto.randomUUID(), order: 2, text: 'Toner' },
      { id: crypto.randomUUID(), order: 3, text: 'Vitamin C Serum' },
      { id: crypto.randomUUID(), order: 4, text: 'Eye Cream' },
      { id: crypto.randomUUID(), order: 5, text: 'Moisturizer' },
      { id: crypto.randomUUID(), order: 6, text: 'Sunscreen SPF 50' }
    ]
  },
  {
    day_of_week: 3,
    time_of_day: 'night',
    steps: [
      { id: crypto.randomUUID(), order: 1, text: 'Oil Cleanser' },
      { id: crypto.randomUUID(), order: 2, text: 'Water-based Cleanser' },
      { id: crypto.randomUUID(), order: 3, text: 'Exfoliating Toner (AHA/BHA)' },
      { id: crypto.randomUUID(), order: 4, text: 'Night Cream' }
    ]
  },
  // Thursday
  {
    day_of_week: 4,
    time_of_day: 'morning',
    steps: [
      { id: crypto.randomUUID(), order: 1, text: 'Cleanser' },
      { id: crypto.randomUUID(), order: 2, text: 'Hyaluronic Acid Serum' },
      { id: crypto.randomUUID(), order: 3, text: 'Moisturizer' },
      { id: crypto.randomUUID(), order: 4, text: 'Sunscreen SPF 50' }
    ]
  },
  {
    day_of_week: 4,
    time_of_day: 'night',
    steps: [
      { id: crypto.randomUUID(), order: 1, text: 'Oil Cleanser' },
      { id: crypto.randomUUID(), order: 2, text: 'Water-based Cleanser' },
      { id: crypto.randomUUID(), order: 3, text: 'Toner' },
      { id: crypto.randomUUID(), order: 4, text: 'Peptide Serum' },
      { id: crypto.randomUUID(), order: 5, text: 'Night Cream' }
    ]
  },
  // Friday
  {
    day_of_week: 5,
    time_of_day: 'morning',
    steps: [
      { id: crypto.randomUUID(), order: 1, text: 'Cleanser' },
      { id: crypto.randomUUID(), order: 2, text: 'Toner' },
      { id: crypto.randomUUID(), order: 3, text: 'Vitamin C Serum' },
      { id: crypto.randomUUID(), order: 4, text: 'Moisturizer' },
      { id: crypto.randomUUID(), order: 5, text: 'Sunscreen SPF 50' }
    ]
  },
  {
    day_of_week: 5,
    time_of_day: 'night',
    steps: [
      { id: crypto.randomUUID(), order: 1, text: 'Oil Cleanser' },
      { id: crypto.randomUUID(), order: 2, text: 'Water-based Cleanser' },
      { id: crypto.randomUUID(), order: 3, text: 'Toner' },
      { id: crypto.randomUUID(), order: 4, text: 'Retinol Serum' },
      { id: crypto.randomUUID(), order: 5, text: 'Night Cream' }
    ]
  },
  // Saturday
  {
    day_of_week: 6,
    time_of_day: 'morning',
    steps: [
      { id: crypto.randomUUID(), order: 1, text: 'Cleanser' },
      { id: crypto.randomUUID(), order: 2, text: 'Sheet Mask' },
      { id: crypto.randomUUID(), order: 3, text: 'Moisturizer' },
      { id: crypto.randomUUID(), order: 4, text: 'Sunscreen SPF 50' }
    ]
  },
  {
    day_of_week: 6,
    time_of_day: 'night',
    steps: [
      { id: crypto.randomUUID(), order: 1, text: 'Oil Cleanser' },
      { id: crypto.randomUUID(), order: 2, text: 'Water-based Cleanser' },
      { id: crypto.randomUUID(), order: 3, text: 'Toner' },
      { id: crypto.randomUUID(), order: 4, text: 'Sleeping Mask' }
    ]
  },
  // Sunday
  {
    day_of_week: 7,
    time_of_day: 'morning',
    steps: [
      { id: crypto.randomUUID(), order: 1, text: 'Cleanser' },
      { id: crypto.randomUUID(), order: 2, text: 'Toner' },
      { id: crypto.randomUUID(), order: 3, text: 'Hyaluronic Acid Serum' },
      { id: crypto.randomUUID(), order: 4, text: 'Moisturizer' },
      { id: crypto.randomUUID(), order: 5, text: 'Sunscreen SPF 50' }
    ]
  },
  {
    day_of_week: 7,
    time_of_day: 'night',
    steps: [
      { id: crypto.randomUUID(), order: 1, text: 'Oil Cleanser' },
      { id: crypto.randomUUID(), order: 2, text: 'Water-based Cleanser' },
      { id: crypto.randomUUID(), order: 3, text: 'Toner' },
      { id: crypto.randomUUID(), order: 4, text: 'Niacinamide Serum' },
      { id: crypto.randomUUID(), order: 5, text: 'Night Cream' }
    ]
  }
] as const;

// Helper to get routine for specific day and time
export function getRoutineForDay(dayOfWeek: number, timeOfDay: 'morning' | 'night') {
  return sampleRoutines.find(
    r => r.day_of_week === dayOfWeek && r.time_of_day === timeOfDay
  );
}

// Day of week helpers (ISO 8601: 1=Monday, 7=Sunday)
export const DAYS_OF_WEEK = [
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
  { value: 7, label: 'Sunday', short: 'Sun' }
] as const;
