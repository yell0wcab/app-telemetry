import { AbstractExceptionsObserver } from "../exceptions/exceptions_observer.js";
import { AbstractLogger, AbstractLoggerFactory } from "../logger/index.js";
import { MetricsObserver } from "../metrics/metrics_observer.js";

export type AppInfo = {
  name: string;
  version: string;
  environment: string;
};

export abstract class AppObserver {
  protected static _observer: AppObserver;

  public static setInstance(observer: AppObserver) {
    this._observer = observer;
  }

  public static getInstance(): AppObserver {
    return this._observer;
  };

  protected constructor(protected loggerFactory: AbstractLoggerFactory) {}

  public createLogger(scope: string, prettify?: boolean, pinnedMetadata?: Record<string, string>): AbstractLogger {
    return this.loggerFactory.createLogger(scope, prettify, pinnedMetadata);
  }
  
  public abstract getExceptionsObserver<InvariantCode extends string>(): AbstractExceptionsObserver<InvariantCode>;
  public abstract getMetricsObserver(): MetricsObserver;
}
