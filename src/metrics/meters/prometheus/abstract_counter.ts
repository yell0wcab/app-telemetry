import { Attributes, Context, Counter, MetricOptions } from "@opentelemetry/api";
import { PrometheusInstrument } from "../prometheus_meter.js";
import { attributesToLabel } from "./utils.js";

export abstract class PromAbstractCounter<AttributesTypes extends Attributes = Attributes> implements Counter<AttributesTypes>, PrometheusInstrument {
  protected name: string;
  protected labelDistribution: Map<string, number> = new Map();

  protected constructor(name: string, protected options?: MetricOptions) {
    name = name.replace(/-/g, '_');
    this.name = name.endsWith("_total") ? name : `${name}_total`;
  }

  protected abstract validateInputValue(value: number): void;

  /**
   * Increment value of counter by the input. Inputs must not be negative.
   */
  public add(value: number, attributes?: AttributesTypes, context?: Context): void {
    this.validateInputValue(value);
    const label = attributesToLabel(attributes);
    PromAbstractCounter.addLabelValue(this.labelDistribution, label, value);
  }

  public getReport() {
    if (this.labelDistribution.size === 0) {
      return undefined;
    }

    const labels = [ ...this.labelDistribution.keys() ];
    labels.sort();

    const report = [
      `# HELP ${this.name} ${this.options?.description || 'description missing'}`,
      `# TYPE ${this.name} counter`,
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
