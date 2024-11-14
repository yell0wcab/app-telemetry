export type ConsoleMetricsExporterConfig = {
  exportIntervalSeconds: number;
};

export type PrometheusMetricsExporterConfig = {
  exportIntervalSeconds: number;
};

export type OTLPHttpMetricsExporterConfig = {
  exportIntervalSeconds: number;
}

export interface OpenTelemetryConfig {
  consoleExporterConfig?: ConsoleMetricsExporterConfig;
  prometheusExporterConfig?: PrometheusMetricsExporterConfig;
  otlpHttpExporterConfig?: OTLPHttpMetricsExporterConfig;
}