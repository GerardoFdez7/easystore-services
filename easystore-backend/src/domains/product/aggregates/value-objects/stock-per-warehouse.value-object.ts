import { z } from 'zod';

const stockPerWarehouseSchema = z.object({
  warehouseId: z
    .number()
    .int()
    .positive({ message: 'warehouseId must be a positive integer' }),
  qtyAvailable: z.number().int().nonnegative({
    message: 'Quantity available must be a non-negative integer',
  }),
  qtyReserved: z.number().int().nonnegative({
    message: 'Quantity reserved must be a non-negative integer',
  }),
  productLocation: z.string().nullable(),
  estimatedReplenishmentDate: z.date().nullable(),
  lotNumber: z.string().nullable(),
  serialNumbers: z
    .array(
      z
        .string()
        .min(1, { message: 'Serial number must be a non-empty string' }),
    )
    .nullable(),
});

const stockPerWarehouseArraySchema = z.array(stockPerWarehouseSchema);

export class StockPerWarehouse {
  private readonly stockDetails: Array<{
    warehouseId: string;
    qtyAvailable: number;
    qtyReserved: number;
    productLocation: string | null;
    estimatedReplenishmentDate: Date | null;
    lotNumber: string | null;
    serialNumbers: string[];
  }>;

  private constructor(
    stockDetails: Array<{
      warehouseId: string;
      qtyAvailable: number;
      qtyReserved: number;
      productLocation: string | null;
      estimatedReplenishmentDate: Date | null;
      lotNumber: string | null;
      serialNumbers: string[];
    }>,
  ) {
    this.stockDetails = stockDetails;
  }

  public static create(
    stockDetails: Array<{
      warehouseId: string;
      qtyAvailable: number;
      qtyReserved: number;
      productLocation: string | null;
      estimatedReplenishmentDate: Date | null;
      lotNumber: string | null;
      serialNumbers: string[];
    }>,
  ): StockPerWarehouse {
    stockPerWarehouseArraySchema.parse(stockDetails);
    return new StockPerWarehouse(stockDetails);
  }

  public getValue(): Array<{
    warehouseId: string;
    qtyAvailable: number;
    qtyReserved: number;
    productLocation: string | null;
    estimatedReplenishmentDate: Date | null;
    lotNumber: string | null;
    serialNumbers: string[];
  }> {
    return this.stockDetails;
  }

  public equals(otherStock: StockPerWarehouse): boolean {
    return (
      JSON.stringify(this.stockDetails) ===
      JSON.stringify(otherStock.stockDetails)
    );
  }
}
