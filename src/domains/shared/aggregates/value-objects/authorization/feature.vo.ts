import { z } from 'zod/v4';

export enum FeatureEnum {
  CATALOG = 'CATALOG',
  INVENTORY = 'INVENTORY',
  ORDERS = 'ORDERS',
  CUSTOMERS = 'CUSTOMERS',
  ANALYTICS = 'ANALYTICS',
  SETTINGS = 'SETTINGS',
}

const featureSchema = z.enum(FeatureEnum);

export class Feature {
  private readonly value: FeatureEnum;

  private constructor(value: FeatureEnum) {
    this.value = value;
  }

  public static create(feature: string): Feature {
    const validatedFeature = featureSchema.parse(feature);
    return new Feature(validatedFeature);
  }

  public getValue(): FeatureEnum {
    return this.value;
  }

  public equals(feature: Feature): boolean {
    return this.value === feature.value;
  }
}
