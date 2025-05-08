export class UpdateProductDTO {
  id: string;
  name?: string;
  categoryIds?: string[];
  shortDescription?: string;
  longDescription?: string | null;
  variants?: VariantDTO[];
  type?: 'PHYSICAL' | 'DIGITAL';
  cover?: string;
  media?: string[];
  availableShippingMethods?: string[];
  shippingRestrictions?: string[];
  tags?: string[];
  installmentPayments?: InstallmentPaymentDTO[];
  acceptedPaymentMethods?: string[];
  sustainability?: SustainabilityDTO[];
  brand?: string | null;
  manufacturer?: string | null;
  warranty?: WarrantyDTO;
}

export class InstallmentPaymentDTO {
  months: number;
  interestRate: number;
}

export class SustainabilityDTO {
  certification: string;
  recycledPercentage: number;
}

export class WarrantyDTO {
  duration: string;
  coverage: string;
  instructions: string;
}

export class VariantDTO {
  attributes: AttributeDTO[];
  stockPerWarehouse: StockPerWarehouseDTO[];
  price: number;
  currency: string;
  variantMedia?: string[];
  personalizationOptions?: string[];
  weight?: number;
  dimensions?: DimensionsDTO;
  condition: string;
  sku?: string;
  upc?: string;
  ean?: string;
  isbn?: string;
  barcode?: string;
}

export class AttributeDTO {
  key: string;
  value: string;
}

export class StockPerWarehouseDTO {
  warehouseId: string;
  qtyAvailable: number;
  qtyReserved: number;
  productLocation: string | null;
  estimatedReplenishmentDate: Date | null;
  lotNumber: string | null;
  serialNumbers: string[];
}

export class DimensionsDTO {
  height: number;
  width: number;
  depth: number;
}
