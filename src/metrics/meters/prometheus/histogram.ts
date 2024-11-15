import { Attributes, Context, Histogram } from "@opentelemetry/api";
import { PrometheusInstrument } from "../prometheus_meter.js";
import { HistogramBucketDescriptor, HistogramMetricOptions } from "../../metrics_observer.js";
import { attributesToLabel } from "./utils.js";

export class HistogramBucketRange {
  constructor(private lowerEdge: number, private upperEdge: number) {
    if (this.lowerEdge >= this.upperEdge) {
      throw new Error("Invalid HistogramBucketRange");
    }
  }

  public matchesValueLowerInclusive(value: number) {
    return this.lowerEdge <= value && value < this.upperEdge;
  }

  public matchesValueUpperInclusive(value: number) {
    return this.lowerEdge < value && value <= this.upperEdge;
  }

  public getRange() {
    return [this.lowerEdge, this.upperEdge];
  }
}

export class HistogramBucket {
  private count: number = 0;
  constructor(private label: string, private range: HistogramBucketRange) {}

  public matchesValueLowerInclusive(value: number) {
    return this.range.matchesValueLowerInclusive(value);
  }

  public matchesValueUpperInclusive(value: number) {
    return this.range.matchesValueUpperInclusive(value);
  }

  public increment() {
    this.count++;
  }

  public getContent() {
    return {
      label: this.label,
      count: this.count,
      range: this.range.getRange()
    }
  }
}

const DEFAULT_BUCKET_DESCRIPTORS: HistogramBucketDescriptor[] = [{
  label: "0",
  range: [-Infinity, 0]
},{
  label: "5",
  range: [0, 5]
}, {
  label: "10",
  range: [5, 10]
}, {
  label: "25",
  range: [10, 25]
}, {
  label: "50",
  range: [25, 50]
}, {
  label: "75",
  range: [50, 75]
}, {
  label: "100",
  range: [75, 100]
}, {
  label: "250",
  range: [100, 250]
}, {
  label: "500",
  range: [250, 500]
}, {
  label: "750",
  range: [500, 750]
}, {
  label: "1000",
  range: [750, 1000]
}, {
  label: "2500",
  range: [1000, 2500]
}, {
  label: "5000",
  range: [2500, 5000]
}, {
  label: "7500",
  range: [5000, 7500]
}, {
  label: "10000",
  range: [7500, 10000]
}, {
  label: "+Inf",
  range: [10000, Infinity]
}];

export class PromCumulativeHistogram<AttributesTypes extends Attributes = Attributes> implements Histogram<AttributesTypes>, PrometheusInstrument {
  public static sortAndValidateBucketDescriptors(bucketDescriptors: HistogramBucketDescriptor[]) {
    bucketDescriptors.forEach((d) => {
      if (d.range[0] >= d.range[1]) {
        throw new Error('Invalid HistogramBucket Range');
      }
    });

    bucketDescriptors.sort((a, b) => {
      if (a.range[0] < b.range[0]) return -1;
      else if (a.range[0] > b.range[0]) return 1;
      else return 0;
    });

    let refDescriptorRange: [ number, number ];
    bucketDescriptors.forEach((d) => {
      if (refDescriptorRange !== undefined) {
        if (d.range[0] < refDescriptorRange[1]) {
          throw new Error('Overlap HistogramBucket Ranges');
        }
      }
    });

    return bucketDescriptors;
  }

  protected name: string;
  protected bucketDescriptors: HistogramBucketDescriptor[];
  protected labelDistribution: Map<string, { count: number; sum: number; buckets: HistogramBucket[] }> = new Map();

  constructor(name: string, protected options?: HistogramMetricOptions) {
    name = name.replace(/-/g, '_');
    this.name = name.endsWith("_distribution") ? name : `${name}_distribution`;
    this.bucketDescriptors = PromCumulativeHistogram.sortAndValidateBucketDescriptors(options?.bucketDescriptors || DEFAULT_BUCKET_DESCRIPTORS);
  }

  public record(value: number, attributes?: AttributesTypes, context?: Context) {
    const label = attributesToLabel(attributes);

    let distribution = this.labelDistribution.get(label);
    if (distribution === undefined) {
      distribution = {
        sum: 0,
        count: 0,
        buckets: this.bucketDescriptors.map((descriptor) => new HistogramBucket(descriptor.label, new HistogramBucketRange(descriptor.range[0], descriptor.range[1])))
      };
      this.labelDistribution.set(label, distribution);
    }

    const bucket = distribution.buckets.find((bin: HistogramBucket) => bin.matchesValueUpperInclusive(value));
    if (bucket !== undefined) {
      bucket.increment();
      distribution.sum += value;
      distribution.count += 1;
    }
  }

  public getReport(): string {
    const report: string[] = [
      `# HELP ${this.name} ${this.options?.description || 'description missing'}`,
      `# TYPE ${this.name} histogram`
    ];

    this.labelDistribution.forEach((distribution, label) => {
      if (label === '') {
        report.push(`${this.name}_count ${distribution.count}`);
        report.push(`${this.name}_sum ${distribution.sum}`);
      }
      else {
        report.push(`${this.name}_count{${label}} ${distribution.count}`);
        report.push(`${this.name}_sum{${label}} ${distribution.sum}`);
      }

      let totalCount = 0;
      distribution.buckets.forEach((bucket) => {
        const content = bucket.getContent();
        const bucketLabel = label === '' ? `le="${content.label}"` : `${label},le="${content.label}"`;
        report.push(`${this.name}_bucket{${bucketLabel}} ${totalCount + content.count}`);

        //
        totalCount += content.count;
      });
    });

    return report.join("\n");
  }
}
