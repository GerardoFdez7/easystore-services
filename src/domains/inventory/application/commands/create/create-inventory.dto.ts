import { IWarehouseBase } from '../../../aggregates/entities';
 
export class CreateInventoryDTO {
  constructor(public readonly data: IWarehouseBase) {}
} 