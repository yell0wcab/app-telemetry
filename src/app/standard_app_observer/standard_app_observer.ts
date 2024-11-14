import opentelemetry, { Meter } from '@opentelemetry/api';
import { PrometheusMeter } from "../../metrics/meters/prometheus_meter.js";
import { MetricsObserver } from "../../metrics/metrics_observer.js";
import { initSentry } from "../../sdk/sentry/initialize_sdk.js";
import { AppInfo, AppObserver } from "../app_observer.js";
import { AbstractExceptionsObserver, ExceptionsObserver } from '../../exceptions/exceptions_observer.js';
import { ExceptionsToLogWriter } from '../../exceptions/writer/log_writer.js';
import { ExceptionsToMetricsWriter } from '../../exceptions/writer/metrics_writer.js';
import { ExceptionsToSentryWriter } from '../../exceptions/writer/sentry_writer.js';
import { AbstractLoggerFactory, LogLevel } from '../../logger/logger.js';
import { ConsoleLoggerFactory } from '../../logger/console_logger.js'
import { initOpenTelemetry } from '../../sdk/open_telemetry/initialize_sdk.js';
import { SentryConfig } from '../../sdk/sentry/config.js';
import { OpenTelemetryConfig } from '../../sdk/open_telemetry/config.js';

export type StandardAppObserverConfig = {
  app: AppInfo,
  loggerFactory?: AbstractLoggerFactory,
  sentry?: SentryConfig,
  otel?: OpenTelemetryConfig
};

export class StandardAppObserver extends AppObserver {
  protected static _instance: StandardAppObserver | undefined;

  public static getInstance(config?: StandardAppObserverConfig): AppObserver {
    if (this._instance === undefined) {
      if (config === undefined) {
        throw new Error('Failed to initialize XAppObserver: missing initialization configuration');
      }

      // configure logger factory
      const loggerFactory = config.loggerFactory || new ConsoleLoggerFactory(LogLevel.INFO);

      if (config.otel) {
        initOpenTelemetry(config.app, config.otel);
      }

      // configure metrics observer
      const meter: Meter = config.otel !== undefined ? opentelemetry.metrics.getMeter(config.app.name, config.app.version) : new PrometheusMeter();
      const metricsObserver = new MetricsObserver(meter, config.app.name);

      // initialize sentry
      if (config.sentry) {
        initSentry(config.app, config.sentry, loggerFactory, metricsObserver);
      }

      // create app observer instance
      this._instance = new StandardAppObserver(loggerFactory, metricsObserver);
    }

    return this._instance;
  }

  protected constructor(loggerFactory: AbstractLoggerFactory, protected metricsObserver: MetricsObserver) {
    super(loggerFactory);
  }

  public getExceptionsObserver<InvariantCode extends string>(): AbstractExceptionsObserver<InvariantCode> {
    return new ExceptionsObserver<InvariantCode>([
      new ExceptionsToLogWriter(this.loggerFactory),
      new ExceptionsToMetricsWriter(this.metricsObserver),
      new ExceptionsToSentryWriter()
    ]);
  }

  public getMetricsObserver() {
    return this.metricsObserver;
  }
}
