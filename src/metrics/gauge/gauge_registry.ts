import { Attributes, Gauge, MetricOptions } from '@opentelemetry/api';
import { InstrumentsConfig } from '../metrics_observer.js';
import { getTypedObjectKeys } from '../../utils/types.js';

export class AppMeterGaugeRegistry<InstrumentIds extends string> {
  protected gauges: Map<string, Gauge> = new Map();

  constructor(createGauge: (name: string, options: MetricOptions) => Gauge, config: InstrumentsConfig<InstrumentIds>, scope?: string) {
    for (const instrumentId of getTypedObjectKeys(config)) {
      const instrumentConfig = config[instrumentId];
      this.gauges.set(instrumentId, createGauge(scope !== undefined ? `${scope}_${instrumentConfig.label}` : instrumentConfig.label, instrumentConfig.options))
    }
  }

  public record(gauge: InstrumentIds, value: number, attributes?: Attributes) {
    this.gauges.get(gauge)?.record(value, attributes);
  }
}
