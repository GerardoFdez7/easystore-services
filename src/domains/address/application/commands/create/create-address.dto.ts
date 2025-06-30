import { IAddressBase } from '../../../aggregates/entities';

export class CreateAddressDTO {
  constructor(public readonly data: IAddressBase) {}
}
