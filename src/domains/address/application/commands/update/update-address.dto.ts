import { IAddressBase } from '../../../aggregates/entities';

type UpdatableAddressFields = Partial<
  Omit<IAddressBase, 'tenantId' | 'customerId'>
>;

export class UpdateAddressDTO {
  constructor(
    public readonly id: string,
    public readonly data: UpdatableAddressFields,
  ) {}
}
