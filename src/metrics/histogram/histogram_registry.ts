import { Attributes, Histogram, MetricOptions } from '@opentelemetry/api';
import { HistogramInstrumentsConfig } from '../metrics_observer.js';
import { getTypedObjectKeys } from '../../utils/types.js';

export class AppMeterHistogramRegistry<InstrumentIds extends string> {
  protected histograms: Map<string, Histogram> = new Map();

  constructor(createHistogram: (name: string, options: MetricOptions) => Histogram, config: HistogramInstrumentsConfig<InstrumentIds>, scope?: string) {
    for (const instrumentId of getTypedObjectKeys(config)) {
      const instrumentConfig = config[instrumentId];
      this.histograms.set(instrumentId, createHistogram(scope !== undefined ? `${scope}_${instrumentConfig.label}` : instrumentConfig.label, instrumentConfig.options))
    }
  }

  public record(histogram: InstrumentIds, value: number, attributes?: Attributes) {
    this.histograms.get(histogram)?.record(value, attributes);
  }
}
