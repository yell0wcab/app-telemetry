import { Attributes, MetricOptions } from "@opentelemetry/api";
import { PromAbstractCounter } from "./abstract_counter.js";

export class PromCounter<AttributesTypes extends Attributes = Attributes> extends PromAbstractCounter<AttributesTypes> {
  constructor(name: string, options?: MetricOptions) {
    super(name, options);
  }

  protected override validateInputValue(value: number): void {
    if (value < 0)
      throw new Error("Counter Metric: Invalid input value");
  }
}
