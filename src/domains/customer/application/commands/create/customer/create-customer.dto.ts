import { ICustomerBase } from '../../../../aggregates/entities';

export class CreateCustomerDto {
  constructor(public readonly data: ICustomerBase) {}
}
