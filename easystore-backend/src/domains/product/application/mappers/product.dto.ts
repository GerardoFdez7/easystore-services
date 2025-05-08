export class ProductDTO {
  id: string;
  name: string;
  categories: string[];
  shortDescription: string;
  longDescription?: string;
  variants: {
    attributes: Array<{ key: string; value: string }>;
    stockPerWarehouse: Array<{
      warehouseId: string;
      qtyAvailable: number;
      qtyReserved: number;
      productLocation: string | null;
      estimatedReplenishmentDate: Date | null;
      lotNumber: string | null;
      serialNumbers: string[];
    }>;
    price: number;
    currency: string;
    variantMedia?: string[];
    personalizationOptions?: string[];
    weight?: number;
    dimensions?: { height: number; width: number; depth: number };
    condition: string;
    sku?: string;
    upc?: string;
    ean?: string;
    isbn?: string;
    barcode?: string;
  }[];
  type: string;
  cover: string;
  media: string[];
  availableShippingMethods: string[];
  shippingRestrictions: string[];
  tags: string[];
  installmentPayments: {
    months: number;
    interestRate: number;
  }[];
  acceptedPaymentMethods: string[];
  sustainability: {
    certification: string;
    recycledPercentage: number;
  }[];
  brand?: string;
  manufacturer?: string;
  warranty?: {
    duration: string;
    coverage: string;
    instructions: string;
  };
  metadata?: {
    deleted?: boolean;
    deletedAt?: Date;
    scheduledForHardDeleteAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
