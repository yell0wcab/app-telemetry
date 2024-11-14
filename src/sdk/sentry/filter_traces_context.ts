import type { SamplingContext } from "@sentry/types";
import { makeRateLimiter, makeThrottler } from "../../utils/throttle.js";

// See: https://github.com/open-telemetry/opentelemetry-specification/blob/24de67b3827a4e3ab2515cd8ab62d5bcf837c586/specification/trace/semantic_conventions/messaging.md
// https://develop.sentry.dev/sdk/event-payloads/span/
// https://develop.sentry.dev/sdk/performance/span-operations/#list-of-operations
export const OpTypes = {
  topic: {
    process: "topic.process",
  },
  rpc: "rpc",
} as const;

const CHATTY_OP_TYPES = new Set<string>([
  OpTypes.topic.process,
]);

/**
 * Throttlers to prevent operations being pushed to Sentry
 * more than N times in T ms. The use for this is a final
 * catch of any runaway operation, such as a spike in RPC traffic
 * or exceptions being thrown every tick.
 */
const opKeySampledThrottle1s = makeThrottler(1000 /* windowMs */, 10 /* maxOccurrences */);
const opKeySampledThrottle1m = makeThrottler(60000 /* windowMs */, 100 /* maxOccurrences */);

/**
 * Throttles sampling by key for 1s and 60s windows.
 */
const throttleSampling = (key: string): boolean => {
  return (
    opKeySampledThrottle1s(key) ||
    opKeySampledThrottle1m(key)
  );
};

const getTracingSampleRateForContextFactory = (chattyOpRateMinTimeMs: number) => {
  /**
  * Rate limiter for particularly chatty operations and to prevent spikes.
  */
  const opKeySampledRateLimiter = makeRateLimiter(chattyOpRateMinTimeMs);

  /**
   * Determine the tracing sample rate for a given transaction.
   *
   * This allows us to modify the rate down for some things, but keep
   * high (or even all samples) for low QPS transactions, like RPCs.
   */
  const getTracingSampleRateForContext = (samplingContext: SamplingContext, chattySampleRateScaler: number) => {
    // Prevent any runaway traces from any type of operation.
    // Nothing will be sampled more than 10 times a second, or 100 times a minute.
    if (throttleSampling(samplingContext.name)) {
      return 0;
    }

    // For things that trigger on every message from the bot, downsample to 10%
    // of the base rate, and allow further downsampling by env var.
    if (samplingContext.attributes && CHATTY_OP_TYPES.has(samplingContext.attributes['sentry.op'] || '')) {
      if (opKeySampledRateLimiter(samplingContext.name)) {
        return 0;
      }

      return 0.1 * chattySampleRateScaler;
    }

    // For everything else, use the base rate.
    return 1.0;
  };

  return getTracingSampleRateForContext;
}

export const createFilterTracesContext = (chattyOpRateMinTimeMs: number) => {
  return {
    getTracingSampleRateForContext: getTracingSampleRateForContextFactory(chattyOpRateMinTimeMs)
  };
}
