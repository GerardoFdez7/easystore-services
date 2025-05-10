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

export type StockPerWarehouseProps = {
  qtyAvailable: number;
  qtyReserved: number;
  productLocation: string | null;
  estimatedReplenishmentDate: Date | null;
  lotNumber: string | null;
  serialNumbers: string[] | null;
};

// Define the type for the stock map
type StockMap = Record<number, StockPerWarehouseProps>;

export class StockPerWarehouse {
  private readonly stockMap: StockMap;

  private constructor(stockMap: StockMap) {
    this.stockMap = stockMap;
  }

  public static create(
    stockDetails: Array<{
      warehouseId: number;
      qtyAvailable: number;
      qtyReserved: number;
      productLocation: string | null;
      estimatedReplenishmentDate: Date | null;
      lotNumber: string | null;
      serialNumbers: string[] | null;
    }>,
  ): StockPerWarehouse {
    stockDetails.forEach((detail) => stockPerWarehouseSchema.parse(detail));

    // Convert array to map
    const stockMap: StockMap = {};
    stockDetails.forEach((detail) => {
      const { warehouseId, ...stockEntry } = detail;
      stockMap[warehouseId] = stockEntry;
    });

    return new StockPerWarehouse(stockMap);
  }

  public getValue(): StockMap {
    return { ...this.stockMap };
  }

  public getStockForWarehouse(
    warehouseId: number,
  ): StockPerWarehouseProps | undefined {
    return this.stockMap[warehouseId];
  }

  public getAllWarehouses(): number[] {
    return Object.keys(this.stockMap).map(Number);
  }

  public equals(otherStock: StockPerWarehouse): boolean {
    return (
      JSON.stringify(this.stockMap) === JSON.stringify(otherStock.stockMap)
    );
  }
}
