export interface ISustainabilityBase {
  certification?: string | null;
  recycledPercentage: number;
  productId: number;
}

export interface ISustainabilitySystem {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISustainabilityType
  extends ISustainabilityBase,
    ISustainabilitySystem {}
