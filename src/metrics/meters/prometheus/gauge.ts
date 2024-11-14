import { Attributes, Context, Gauge, MetricOptions } from "@opentelemetry/api";
import { PrometheusInstrument } from "../prometheus_meter.js";
import { attributesToLabel } from "./utils.js";

export class PromGauge<AttributesTypes extends Attributes = Attributes> implements Gauge<AttributesTypes>, PrometheusInstrument {
  protected labelDistribution: Map<string, number> = new Map();

  public constructor(protected name: string, protected options?: MetricOptions) {}

  /**
   * Records a measurement.
   */
  public record(value: number, attributes?: AttributesTypes, context?: Context): void {
    const label = attributesToLabel(attributes);
    PromGauge.addLabelValue(this.labelDistribution, label, value);
  }

  public getReport() {
    if (this.labelDistribution.size === 0) {
      return;
    };

    const labels = [ ...this.labelDistribution.keys() ];
    labels.sort();

    const report = [
      `# HELP ${this.name} ${this.options?.description || 'description missing'}`,
      `# TYPE ${this.name} gauge`,
      ...labels.map((label) => {
        const value = this.labelDistribution.get(label)!;
        return label === '' ? `${this.name} ${value}` : `${this.name}{${label}} ${value}`;
      })
    ];

    return report.join("\n");
  }

  public static addLabelValue(labelDistribution: Map<string, number>, label: string, value: number) {
    const counterValue = labelDistribution.get(label);

    if (counterValue === undefined) {
      labelDistribution.set(label, 1);
    }
    else {
      labelDistribution.set(label, value + counterValue);
    }
  }
}
