import { IAddressBase } from '../../../aggregates/entities';

export class CreateAddressDto {
  constructor(public readonly data: IAddressBase) {}
}
