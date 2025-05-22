export interface IWarrantyType extends IWarrantyBase, IWarrantySystem {}

export interface IWarrantyBase {
  months: number;
  coverage: string;
  instructions: string;
  variantId: number;
}

export interface IWarrantySystem {
  id: number;
  updatedAt: Date;
  createdAt: Date;
}
