export interface ISustainabilityBase {
  certification?: string;
  recycledPercentage: number;
  productId: string;
}

export interface ISustainabilitySystem {
  id: string;
}

export interface ISustainabilityType
  extends ISustainabilityBase,
    ISustainabilitySystem {}
