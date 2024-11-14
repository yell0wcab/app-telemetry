import type { Integration } from "@sentry/types";

export interface SentryConfig {
  enabled: boolean;
  debug?: boolean;
  dsn?: string;
  // Passed as-is to Sentry as profilesSampleRate.
  profilesSampleRate: number;
  // A base rate that tracesSampler multiplies by its weighted outputs by op type.
  // This allows reducing the rate proportionally to the weighted outputs.
  baseTracingRate: number;
  /**
   * An extra scaler that tunes down any op types marked as chatty, which
   * are already tuned down by 10%. This allows reducing rates that are too chatty
   * in prod, but maintain much higher rates for RPC transactions.
   * The specific use case is tuning down the number of message topic samples
   * independently of other sample rates.
   */
  chattySampleRateScaler: number;
  /**
   * The minimum time in ms between samples of chatty operations per key.
   */
  chattyOpRateMinTimeMs: number;
  // extra integrations
  integrations?: Integration[];
}
