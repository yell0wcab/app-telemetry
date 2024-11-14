import { Attributes } from "@opentelemetry/api";

export function attributesToLabel<AttributesTypes extends Attributes>(attributes?: AttributesTypes) {
  if (attributes === undefined) {
    return '';
  }
  else {
    const attributeKeys = Object.keys(attributes);
    attributeKeys.sort();
    return attributeKeys.map((key) => `${key}="${attributes[key]!.toString()}"`).join(",");  
  }
}