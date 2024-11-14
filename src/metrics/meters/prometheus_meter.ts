import {
  Attributes,
  BatchObservableCallback,
  Counter,
  Gauge,
  Histogram,
  Meter,
  MetricOptions,
  Observable,
  ObservableCounter,
  ObservableGauge,
  ObservableUpDownCounter,
  UpDownCounter
} from "@opentelemetry/api";
import { PromCounter } from "./prometheus/counter.js";
import { PromUpDownCounter } from "./prometheus/up_down_counter.js";
import { PromGauge } from "./prometheus/gauge.js";
import { HistogramMetricOptions } from "../metrics_observer.js";
import { PromCumulativeHistogram } from "./prometheus/histogram.js";

export interface PrometheusInstrument {
  getReport(): string | undefined;
};

export class PrometheusMeter implements Meter {
  protected static instruments: Map<string, PrometheusInstrument> = new Map();

  public static getReport() {
    const keys = [ ...this.instruments.keys()];
    keys.sort();

    return keys.map((key) => {
      const instrument = this.instruments.get(key)!;
      return instrument.getReport();
    }).filter((report) => report !== undefined).join("\n");
  }

  /**
   * Creates and returns a new `Gauge`.
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  public createGauge<AttributesTypes extends Attributes = Attributes>(name: string, options?: MetricOptions): Gauge<AttributesTypes> {
    const gauge = new PromGauge(name, options);
    PrometheusMeter.instruments.set(`gauge:${name}`, gauge);
    return gauge;
  }

  /**
   * Creates and returns a new `Histogram`.
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  public createHistogram<AttributesTypes extends Attributes = Attributes>(name: string, options?: HistogramMetricOptions): Histogram<AttributesTypes> {
    const histogram = new PromCumulativeHistogram(name, options);
    PrometheusMeter.instruments.set(`histogram:${name}`, histogram);
    return histogram;
  }

  /**
   * Creates a new `Counter` metric. Generally, this kind of metric when the
   * value is a quantity, the sum is of primary interest, and the event count
   * and value distribution are not of primary interest.
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  public createCounter<AttributesTypes extends Attributes = Attributes>(name: string, options?: MetricOptions): Counter<AttributesTypes> {
    const counter = new PromCounter(name, options);
    PrometheusMeter.instruments.set(`counter:${name}`, counter);
    return counter;
  }

  /**
   * Creates a new `UpDownCounter` metric. UpDownCounter is a synchronous
   * instrument and very similar to Counter except that Add(increment)
   * supports negative increments. It is generally useful for capturing changes
   * in an amount of resources used, or any quantity that rises and falls
   * during a request.
   * Example uses for UpDownCounter:
   * <ol>
   *   <li> count the number of active requests. </li>
   *   <li> count memory in use by instrumenting new and delete. </li>
   *   <li> count queue size by instrumenting enqueue and dequeue. </li>
   *   <li> count semaphore up and down operations. </li>
   * </ol>
   *
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  public createUpDownCounter<AttributesTypes extends Attributes = Attributes>(name: string, options?: MetricOptions): UpDownCounter<AttributesTypes> {
    const counter = new PromUpDownCounter(name, options);
    PrometheusMeter.instruments.set(`up-down-counter:${name}`, counter);
    return counter;
  }

  /**
   * Creates a new `ObservableGauge` metric.
   *
   * The callback SHOULD be safe to be invoked concurrently.
   *
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  public createObservableGauge<AttributesTypes extends Attributes = Attributes>(name: string, options?: MetricOptions): ObservableGauge<AttributesTypes> {
    throw new Error('not implemented');
  }

  /**
   * Creates a new `ObservableCounter` metric.
   *
   * The callback SHOULD be safe to be invoked concurrently.
   *
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  public createObservableCounter<AttributesTypes extends Attributes = Attributes>(name: string, options?: MetricOptions): ObservableCounter<AttributesTypes> {
    throw new Error('not implemented');
  }

  /**
   * Creates a new `ObservableUpDownCounter` metric.
   *
   * The callback SHOULD be safe to be invoked concurrently.
   *
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  public createObservableUpDownCounter<AttributesTypes extends Attributes = Attributes>(name: string, options?: MetricOptions): ObservableUpDownCounter<AttributesTypes> {
    throw new Error('not implemented');
  }

  /**
   * Sets up a function that will be called whenever a metric collection is
   * initiated.
   *
   * If the function is already in the list of callbacks for this Observable,
   * the function is not added a second time.
   *
   * Only the associated observables can be observed in the callback.
   * Measurements of observables that are not associated observed in the
   * callback are dropped.
   *
   * @param callback the batch observable callback
   * @param observables the observables associated with this batch observable callback
   */
  public addBatchObservableCallback<AttributesTypes extends Attributes = Attributes>(callback: BatchObservableCallback<AttributesTypes>, observables: Observable<AttributesTypes>[]): void {
    throw new Error('not implemented');
  }

  /**
   * Removes a callback previously registered with {@link Meter.addBatchObservableCallback}.
   *
   * The callback to be removed is identified using a combination of the callback itself,
   * and the set of the observables associated with it.
   *
   * @param callback the batch observable callback
   * @param observables the observables associated with this batch observable callback
   */
  public removeBatchObservableCallback<AttributesTypes extends Attributes = Attributes>(callback: BatchObservableCallback<AttributesTypes>, observables: Observable<AttributesTypes>[]): void {
    throw new Error('not implemented');
  }
}

export class PrometheusReporter {
  public static getReport() {
    return PrometheusMeter.getReport();
  }
}