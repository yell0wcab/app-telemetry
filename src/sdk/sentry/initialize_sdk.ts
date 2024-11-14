import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { SentryConfig } from "./config.js";
import { AppInfo } from "../../app/app_observer.js";
import { makeInstrumentsConfig, MetricsObserver } from "../../metrics/metrics_observer.js";
import { AbstractLoggerFactory, LogLevel } from "../../logger/logger.js";
import { createFilterTracesContext } from "./filter_traces_context.js";
import { createFilterEventsContext } from "./filter_events_context.js";

// counters
const appCounters = makeInstrumentsConfig({
  eventDropped: {
    label: 'sentry_event_dropped',
    options: {}
  },
  eventPublished: {
    label: 'sentry_event_published',
    options: {}
  }
});

export const initSentry = (appInfo: AppInfo, config: SentryConfig, loggerFactory: AbstractLoggerFactory, metricsObserver: MetricsObserver) => {
  if (!config.enabled) {
    return;
  }

  // logger
  const logger = loggerFactory.createLogger("sentry");

  // metrics observer
  const counterRegistry = metricsObserver.createCounterRegistry(appCounters, "observer");

  // data filtering
  const filterTracesContext = createFilterTracesContext(config.chattyOpRateMinTimeMs);
  const filterEventsContext = createFilterEventsContext();

  // integrations
  const extraIntegrations = config.integrations || [];

  logger.json('InitializingSentry', {
    message: `Initializing Sentry with profilesSampleRate=${config.profilesSampleRate}, baseTracingRate=${config.baseTracingRate}`,
  }, LogLevel.DEBUG);

  Sentry.init({
    debug: true,
    dsn: config.dsn,
    release: appInfo.version,
    environment: appInfo.environment,
    integrations: [
      Sentry.httpIntegration(),
      nodeProfilingIntegration(),
      ...extraIntegrations,
    ],
    // Performance Monitoring
    tracesSampler: (samplingContext): number => {
      return filterTracesContext.getTracingSampleRateForContext(samplingContext, config.chattySampleRateScaler) * config.baseTracingRate;
    },
    // Note that the profiling sample rate is relative to the tracing sampler.
    profilesSampleRate: config.profilesSampleRate,
    beforeSend: (event, hint) => {
      const key = hint.syntheticException?.message ?? event.message ?? event.breadcrumbs?.join(',') ?? 'undefined';

      // Prevent any runaway capturing of any exception.
      // Nothing of the same type will be sampled more than permitted by the throttling windows.
      if (filterEventsContext.throttleEventKey(key)) {
        logger.json('ThrottlingSentryEvent', {
          message: `Throttling sentry event "${hint.event_id}" key="${key}" for exception`,
          metadata: {
            key,
          },
          attachment: {
            hint,
            key,
          }
        },
        LogLevel.WARNING);

        counterRegistry.increment('eventDropped', {
          key,
        });

        return null;
      }

      counterRegistry.increment('eventPublished', {
        key,
      });

      return event;
    },
  });
}
