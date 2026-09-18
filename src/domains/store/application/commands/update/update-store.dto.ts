import { IStoreBase } from '../../../aggregates/entities';

export class UpdateStoreDTO {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly data: Partial<Omit<IStoreBase, 'tenantId'>>,
  ) {}
}
