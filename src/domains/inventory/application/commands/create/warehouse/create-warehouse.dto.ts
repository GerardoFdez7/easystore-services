import { IWarehouseBase } from '../../../../aggregates/entities';

export class CreateWarehouseDTO {
  constructor(public readonly data: IWarehouseBase) {}
}
