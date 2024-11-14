import { makeThrottler } from "../../utils/throttle.js";

/** Throttler for events (e.g. exceptions) to prevent collecting >10/min */
const eventKeyPushThrottle1m = makeThrottler(60000 /* windowMs */, 10 /* maxOccurrences */);
/** Throttler for events (e.g. exceptions) to prevent collecting >20/10min */
const eventKeyPushThrottle10m = makeThrottler(10 * 60000 /* windowMs */, 20 /* maxOccurrences */);
/** Throttler for events (e.g. exceptions) to prevent collecting >40/hr */
const eventKeyPushThrottle60m = makeThrottler(60 * 60000 /* windowMs */, 40 /* maxOccurrences */);

/**
 * Throttles pushing events by key for 1m, 10m, and 60m windows.
 * @exported-for-testing
 */
const throttleEventKey = (key: string): boolean => {
  // NOTE: Intentionally increment all windows, instead of short-circuiting
  // which would prevent 10m/60m windows from incrementing when smaller
  // windows are throttling.
  const throttle1m = eventKeyPushThrottle1m(key);
  const throttle10m = eventKeyPushThrottle10m(key);
  const throttle60m = eventKeyPushThrottle60m(key);

  return throttle1m || throttle10m || throttle60m;
};

export const createFilterEventsContext = () => {
  return {
    throttleEventKey
  };
}
