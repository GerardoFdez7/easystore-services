import { IStockPerWarehouseType } from '../../../aggregates/entities';

export interface StockPerWarehouseDTO extends IStockPerWarehouseType {
  productName?: string;
  variantSku?: string;
  variantFirstAttribute?: { key: string; value: string };
}
