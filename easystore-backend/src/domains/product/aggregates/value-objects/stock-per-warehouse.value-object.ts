import { z } from 'zod';

const stockPerWarehouseSchema = z.object({
  warehouseId: z
    .number()
    .int()
    .positive({ message: 'warehouseId must be a positive integer' }),
  qtyAvailable: z
    .number()
    .int()
    .nonnegative({
      message: 'Quantity available must be a non-negative integer',
    })
    .optional()
    .default(0),
  qtyReserved: z
    .number()
    .int()
    .nonnegative({
      message: 'Quantity reserved must be a non-negative integer',
    })
    .nullish(),
  productLocation: z.string().nullish(),
  estimatedReplenishmentDate: z.date().nullish(),
  lotNumber: z.string().nullish(),
  serialNumbers: z
    .array(
      z
        .string()
        .min(1, { message: 'Serial number must be a non-empty string' }),
    )
    .nullish(),
});

export type StockPerWarehouseProps = {
  warehouseId: number;
  qtyAvailable?: number;
  qtyReserved?: number | null;
  productLocation?: string | null;
  estimatedReplenishmentDate?: Date | null;
  lotNumber?: string | null;
  serialNumbers?: string[] | [];
};

export class StockPerWarehouse {
  private readonly props: StockPerWarehouseProps;

  private constructor(props: StockPerWarehouseProps) {
    this.props = props;
  }

  public static create(stockDetail: StockPerWarehouseProps): StockPerWarehouse {
    stockPerWarehouseSchema.parse(stockDetail);
    return new StockPerWarehouse(stockDetail);
  }

  public getValue(): StockPerWarehouseProps {
    return { ...this.props };
  }

  public getWarehouseId(): number {
    return this.props.warehouseId;
  }

  public equals(otherStock: StockPerWarehouse): boolean {
    return JSON.stringify(this.props) === JSON.stringify(otherStock.props);
  }
}
