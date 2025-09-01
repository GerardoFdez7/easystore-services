import { Injectable } from '@nestjs/common';
import { IAddressAdapter } from '../../application/ports';
import { AddressDetailsDTO } from '@domains/dtos';
import { QueryBus } from '@nestjs/cqrs';
import { GetAddressesDetailsDTO } from '@address/application/queries';

@Injectable()
export class AddressAdapter implements IAddressAdapter {
  constructor(private queryBus: QueryBus) {}

  async getAddressDetails(addressIds: string[]): Promise<AddressDetailsDTO[]> {
    return this.queryBus.execute(new GetAddressesDetailsDTO(addressIds));
  }
}
