import opentelemetry, { DiagConsoleLogger, DiagLogLevel, diag } from "@opentelemetry/api";
import { ConsoleMetricExporter, MeterProvider, MetricReader, PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { Resource } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { AppInfo } from "../../app/app_observer.js";
import { OpenTelemetryConfig } from "./config.js";

export const initOpenTelemetry = (appInfo: AppInfo, config: OpenTelemetryConfig) => {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

  const metricReaders: MetricReader[] = [];

  if (config.consoleExporterConfig) {
    metricReaders.push(new PeriodicExportingMetricReader({
      exporter: new ConsoleMetricExporter(),
      exportIntervalMillis: config.consoleExporterConfig.exportIntervalSeconds * 1000
    }));
  }

  if (config.prometheusExporterConfig) {
    metricReaders.push(new PrometheusExporter({}, (err) => {
      if (err) {
        console.log("failed to run PrometheusExporter", err);
      }
      else {
        const { endpoint, port} = PrometheusExporter.DEFAULT_OPTIONS;
        console.log(`prometheus scrape endpoint: http://localhost:${port}${endpoint}`);
      }
    }));
  }

  if (config.otlpHttpExporterConfig) {
    metricReaders.push(new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter(),
      exportIntervalMillis: config.otlpHttpExporterConfig.exportIntervalSeconds * 1000
    }));
  }

  const meterProvider = new MeterProvider({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: appInfo.name,
      [ATTR_SERVICE_VERSION]: appInfo.version
    }),
    readers: metricReaders
  });

  opentelemetry.metrics.setGlobalMeterProvider(meterProvider);
}
