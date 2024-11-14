import { AppObserver } from "../index.js";
import { StandardAppObserver } from "../index.js";
import { InvariantException } from "../exceptions/exceptions_observer.js";
import { makeHistogramInstrumentsConfig, makeInstrumentsConfig } from "../metrics/metrics_observer.js";
import { PrometheusMeter } from "../metrics/meters/prometheus_meter.js";

// application initialization
AppObserver.setInstance(StandardAppObserver.getInstance({
  app: {
    name: "test",
    version: "v1.0.0",
    environment: "development"
  },
  sentry: {
    enabled: false,
    dsn: 'https://9cffd07acb0ee5a198fe8b09a9c51c8d@o4508100355293184.ingest.us.sentry.io/4508100364009472',
    baseTracingRate: 1.0,
    profilesSampleRate: 1.0,
    /**
     * Adjustment for CHATTY_OP_TYPES to allow scaling down only this metric.
     */
    chattySampleRateScaler: 1.0,
    /**
     * Time between chatty ops (keyed by transaction name) to rate limit the noisiest events.
     */
    chattyOpRateMinTimeMs: 100.0,
  },
  // otel: {
  //   // consoleExporterConfig: {
  //   //   exportIntervalSeconds: 10
  //   // },
  //   prometheusExporterConfig: {
  //     exportIntervalSeconds: 5
  //   }
  // }
}));

// application exceptions observer
type InvariantCode = 
  | 'no_subscriptions_for_topic'
  | 'attempted_bca_rpc_no_client'
  | 'attempted_send_proto_without_connection';
const exceptionsObserver = AppObserver.getInstance().getExceptionsObserver<InvariantCode>();

exceptionsObserver.captureInvariantException(new InvariantException('attempted_send_proto_without_connection', 'message'));
exceptionsObserver.captureInvariantException(new InvariantException('attempted_bca_rpc_no_client', 'message'), {a: "value A", b: "value B"});
exceptionsObserver.captureInvariantException(new InvariantException('attempted_send_proto_without_connection', 'message'), {a: "value a", b: "value b"});
exceptionsObserver.captureException(new Error('error message'), 'breadcrumb');
exceptionsObserver.captureException(new Error('error message'), 'breadcrumb', {a: 'value A', b: 'value b'});

// application metrics
const metricsObserver = AppObserver.getInstance().getMetricsObserver();

// counters
const appCounters = makeInstrumentsConfig({
  exceptionCaptured: {
    label: 'exception_captured',
    options: {}
  },
  invariantTriggered: {
    label: 'invariant_triggered',
    options: {}
  },
  obSpanStatus: {
    label: 'ob_span_status',
    options: {}
  },
  obTransactionRecordedToSentry: {
    label: 'ob_transaction_recorded_to_sentry',
    options: {}
  },
});
const counterRegistry = metricsObserver.createCounterRegistry(appCounters, "counter");
counterRegistry.add('exceptionCaptured', 10);
counterRegistry.increment('obSpanStatus');
counterRegistry.increment('obSpanStatus');

const counterRegistry2 = metricsObserver.createCounterRegistry(appCounters);
counterRegistry2.add('exceptionCaptured', 10);
counterRegistry2.increment('obSpanStatus');

// gauges
const appGauges = makeInstrumentsConfig({
  exceptionCaptured: {
    label: 'exception_captured',
    options: {}
  },
  invariantTriggered: {
    label: 'invariant_triggered',
    options: {}
  },
  obSpanStatus: {
    label: 'ob_span_status',
    options: {}
  },
  obTransactionRecordedToSentry: {
    label: 'ob_transaction_recorded_to_sentry',
    options: {}
  },
});

const gaugeRegistry = metricsObserver.createGaugeRegistry(appGauges, "black-bottle");
gaugeRegistry.record('exceptionCaptured', 20);
gaugeRegistry.record('obTransactionRecordedToSentry', 147, { bingo: "mango" });

// histograms
const appHistograms = makeHistogramInstrumentsConfig({
  yellow: {
    label: 'yellow_distribution',
    options: {}
  },
  green: {
    label: 'green_distribution',
    options: {}
  },
});

const histogramRegistry = metricsObserver.createHistogramRegistry(appHistograms, "histogram");
histogramRegistry.record('green', 10);
histogramRegistry.record('green', 100, { x: "value X", y: "value Y"});
histogramRegistry.record('yellow', 0);
histogramRegistry.record('yellow', 1);
histogramRegistry.record('yellow', 49);
histogramRegistry.record('yellow', 50);
histogramRegistry.record('yellow', 51);
histogramRegistry.record('yellow', 52);
histogramRegistry.record('yellow', 1, { x: "value X", y: "value Y"});

if (true) {
  console.log(PrometheusMeter.getReport());
}
else {
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(undefined);
    }, 200*1000);
  }).then(() => console.log("Done"));
}

