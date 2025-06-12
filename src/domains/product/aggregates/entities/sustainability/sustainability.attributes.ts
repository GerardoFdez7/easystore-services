export interface ISustainabilityBase {
  certification?: string;
  recycledPercentage: number;
  productId: number;
}

export interface ISustainabilitySystem {
  id: number;
}

export interface ISustainabilityType
  extends ISustainabilityBase,
    ISustainabilitySystem {}
