import { ICustomerBase } from 'src/domains/customer/aggregates/entities/customer.attributes';

export class CreateCustomerDto {
  constructor(public readonly data: ICustomerBase) {}
}
