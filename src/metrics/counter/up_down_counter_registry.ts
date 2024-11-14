import { Attributes, UpDownCounter, MetricOptions } from '@opentelemetry/api';
import { InstrumentsConfig } from '../metrics_observer.js';
import { getTypedObjectKeys } from '../../utils/types.js';

export class AppMeterUpDownCounterRegistry<InstrumentIds extends string> {
  protected counters: Map<string, UpDownCounter> = new Map();

  constructor(createCounter: (name: string, options: MetricOptions) => UpDownCounter, config: InstrumentsConfig<InstrumentIds>, scope?: string) {
    for (const instrumentId of getTypedObjectKeys(config)) {
      const instrumentConfig = config[instrumentId];
      this.counters.set(instrumentId, createCounter(scope !== undefined ? `${scope}_${instrumentConfig.label}` : instrumentConfig.label, instrumentConfig.options))
    }
  }

  public increment(counter: InstrumentIds, attributes?: Attributes) {
    this.add(counter, 1, attributes);
  }

  public decrement(counter: InstrumentIds, attributes?: Attributes) {
    this.add(counter, -1, attributes);
  }

  public add(counter: InstrumentIds, value: number, attributes?: Attributes) {
    this.counters.get(counter)?.add(value, attributes);
  }

  public sub(counter: InstrumentIds, value: number, attributes?: Attributes) {
    this.counters.get(counter)?.add(-value, attributes);
  }
}
