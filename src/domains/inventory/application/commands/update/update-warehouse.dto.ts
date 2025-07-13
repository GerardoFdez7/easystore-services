import { IWarehouseBase } from '../../../aggregates/entities';

export class UpdateWarehouseDTO {
  constructor(
    public readonly id: string,
    public readonly data: Partial<IWarehouseBase>
  ) {}
} 