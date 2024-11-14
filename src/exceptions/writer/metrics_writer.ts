import { AppMeterCounterRegistry } from "../../metrics/counter/counter_registry.js";
import { makeInstrumentsConfig, MetricsObserver } from "../../metrics/metrics_observer.js";
import { ExceptionsWriter, InvariantException } from "../exceptions_observer.js";

// counters
const appCounters = makeInstrumentsConfig({
  exceptionCaptured: {
    label: 'exception_captured',
    options: {}
  },
  invariantTriggered: {
    label: 'invariant_triggered',
    options: {}
  }
});

export class ExceptionsToMetricsWriter<InvariantCode extends string> extends ExceptionsWriter<InvariantCode> {
  protected counterRegistry: AppMeterCounterRegistry<keyof typeof appCounters>;

  constructor(metricsObserver: MetricsObserver) {
    super();
    this.counterRegistry = metricsObserver.createCounterRegistry(appCounters, "observer");
  }

  public writeException(_exception: Error, breadcrumb: string, metadata?: Record<string, string>): void {
    this.counterRegistry.increment('exceptionCaptured', {
      breadcrumb,
      ...metadata
    });
  }

  public writeInvariantException(exception: InvariantException<InvariantCode>, metadata?: Record<string, string>): void {
    const invariantCode = exception.getInvariantCode();
    this.counterRegistry.increment('invariantTriggered', {
      invariantCode,
      ...metadata,
    });
  }
}
