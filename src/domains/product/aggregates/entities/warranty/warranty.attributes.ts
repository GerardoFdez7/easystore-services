export interface IWarrantyType extends IWarrantyBase, IWarrantySystem {}

export interface IWarrantyBase {
  months: number;
  coverage: string;
  instructions: string;
  variantId: string;
}

export interface IWarrantySystem {
  id: string;
}
