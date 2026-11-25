// Data is considered fresh for 5 minutes (same value as the previous React Query setup).
export const STALE_TIME_MS = 5 * 60 * 1000;
export const isStale = (lastFetched) => !lastFetched || Date.now() - lastFetched > STALE_TIME_MS;
export const errorText = (error) =>
  navigator.onLine ? error?.message || "Something went wrong." : "You are offline and this data is not cached yet.";
