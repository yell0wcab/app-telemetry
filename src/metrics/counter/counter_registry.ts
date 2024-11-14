import { Attributes, Counter, MetricOptions } from '@opentelemetry/api';
import { InstrumentsConfig } from '../metrics_observer.js';
import { getTypedObjectKeys } from '../../utils/types.js';

export class AppMeterCounterRegistry<InstrumentIds extends string> {
  protected counters: Map<string, Counter> = new Map();

  constructor(createCounter: (name: string, options: MetricOptions) => Counter, config: InstrumentsConfig<InstrumentIds>, scope?: string) {
    for (const instrumentId of getTypedObjectKeys(config)) {
      const instrumentConfig = config[instrumentId];
      this.counters.set(instrumentId, createCounter(scope !== undefined ? `${scope}_${instrumentConfig.label}` : instrumentConfig.label, instrumentConfig.options))
    }
  }

  public increment(counter: InstrumentIds, attributes?: Attributes) {
    this.add(counter, 1, attributes);
  }

  public add(counter: InstrumentIds, value: number, attributes?: Attributes) {
    this.counters.get(counter)?.add(value, attributes);
  }
}
