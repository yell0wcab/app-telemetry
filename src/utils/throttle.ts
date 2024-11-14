/**
 * Creates a method that returns whether an operation should be rate limited
 * given the minimum time required between operations.
 */
export const makeRateLimiter = (minTimeMs: number) => {
  const rateLimitDict: Record<string, number> = {};

  return (key: string) => {
    const nowMs = performance.now();
    const maybeLastMs = rateLimitDict[key];
    if (maybeLastMs !== undefined && nowMs - maybeLastMs < minTimeMs) {
      return true;
    }

    rateLimitDict[key] = nowMs;

    return false;
  };
};

/**
 * Creates a method that returns whether an operation should be throttled given
 * a sample window and the max occurrences that can happen within that sample
 * period.
 *
 * Returns true if the operation should be throttled.
 */
export const makeThrottler = (windowMs: number, maxOccurrences: number) => {
  const throttleDict: Record<string, {
    windowStartTimeMs: number,
    occurrencesInWindow: number,
  }> = {};

  return (key: string): boolean => {
    const nowMs = performance.now();
    const maybeEntry = throttleDict[key];
    if (maybeEntry) {
      if (nowMs - maybeEntry.windowStartTimeMs < windowMs) {
        // We're within the sample window still, so keep this sample window and
        // increment the occurrences.
        maybeEntry.occurrencesInWindow++;

        if (maybeEntry.occurrencesInWindow > maxOccurrences) {
          return true;
        }

        // We're in the window but can take more occurrences, so early return.
        return false;
      }
    }

    // We're either not in the window, or no entry exists yet, so create a new one.
    throttleDict[key] = {
      windowStartTimeMs: nowMs,
      occurrencesInWindow: 1,
    };

    return false;
  }
};
