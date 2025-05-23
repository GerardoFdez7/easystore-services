export interface ISustainabilityBase {
  certification?: string | null;
  recycledPercentage: number;
  productId: number;
}

export interface ISustainabilitySystem {
  id: number;
}

export interface ISustainabilityType
  extends ISustainabilityBase,
    ISustainabilitySystem {}
