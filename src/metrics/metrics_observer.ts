import { Meter, MetricOptions } from '@opentelemetry/api';
import { AppMeterCounterRegistry } from './counter/counter_registry.js';
import { AppMeterUpDownCounterRegistry } from './counter/up_down_counter_registry.js';
import { AppMeterGaugeRegistry } from './gauge/gauge_registry.js';
import { AppMeterHistogramRegistry } from './histogram/histogram_registry.js';

export type InstrumentConfig = {
  label: string;
  options: MetricOptions;
}

export type HistogramBucketDescriptor = {
  label: string;
  range: [ number, number ];
};

export type HistogramMetricOptions = MetricOptions & {
  bucketDescriptors?: HistogramBucketDescriptor[];
};

export type HistogramInstrumentConfig = {
  label: string;
  options: HistogramMetricOptions;
}

export type InstrumentsConfig<InstrumentIds extends string> = Record<InstrumentIds, InstrumentConfig>;
export type HistogramInstrumentsConfig<InstrumentIds extends string> = Record<InstrumentIds, HistogramInstrumentConfig>;

export const makeInstrumentsConfig = <K extends string, T extends InstrumentsConfig<K>>(config: T): T => {
  return config;
}

export const makeHistogramInstrumentsConfig = <K extends string, T extends HistogramInstrumentsConfig<K>>(config: T): T => {
  return config;
}

export class MetricsObserver {
  constructor(protected meter: Meter, protected name: string) {
  }

  public createCounterRegistry<InstrumentIds extends string>(countersConfig: InstrumentsConfig<InstrumentIds>, scope?: string) {
    return new AppMeterCounterRegistry(this.createCounter.bind(this), countersConfig, scope);
  }

  public createUpDownCounterRegistry<InstrumentIds extends string>(countersConfig: InstrumentsConfig<InstrumentIds>, scope?: string) {
    return new AppMeterUpDownCounterRegistry(this.createUpDownCounter.bind(this), countersConfig, scope);
  }

  public createGaugeRegistry<InstrumentIds extends string>(gaugesConfig: InstrumentsConfig<InstrumentIds>, scope?: string) {
    return new AppMeterGaugeRegistry(this.createGauge.bind(this), gaugesConfig, scope);
  }

  public createHistogramRegistry<InstrumentIds extends string>(histogramsConfig: HistogramInstrumentsConfig<InstrumentIds>, scope?: string) {
    return new AppMeterHistogramRegistry(this.createHistogram.bind(this), histogramsConfig, scope);
  }

  public createCounter(name: string, options?: MetricOptions) {
    return this.meter.createCounter(`${this.name}_${name}`, options);
  }

  public createUpDownCounter(name: string, options?: MetricOptions) {
    return this.meter.createUpDownCounter(`${this.name}_${name}`, options);
  }

  public createGauge(name: string, options?: MetricOptions) {
    return this.meter.createGauge(`${this.name}_${name}`, options);
  }

  public createHistogram(name: string, options?: HistogramMetricOptions) {
    return this.meter.createHistogram(`${this.name}_${name}`, options);
  }
}
