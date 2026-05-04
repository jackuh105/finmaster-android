/**
 * Helper to calculate milliseconds until the next midnight (00:00:00).
 * Used for cache stale time to ensure data is fetched once per day.
 */
export function getMillisecondsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);

  // Set to tomorrow 00:00:00
  midnight.setHours(24, 0, 0, 0);

  // Return difference in milliseconds
  return midnight.getTime() - now.getTime();
}
