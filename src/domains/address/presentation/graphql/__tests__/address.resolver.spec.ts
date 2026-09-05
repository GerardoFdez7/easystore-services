import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AddressTypeEnum } from '../../../aggregates/value-objects';

jest.mock('../../../application/commands', () => ({
  CreateAddressDTO: class CreateAddressDTO {
    constructor(public readonly data: unknown) {}
  },
  AddressDeleteDTO: class AddressDeleteDTO {},
  UpdateAddressDTO: class UpdateAddressDTO {},
}));
jest.mock('../../../application/queries', () => ({
  GetAddressIdDto: class GetAddressIdDto {},
  GetAllAddressesDTO: class GetAllAddressesDTO {},
  GetAllCountriesDTO: class GetAllCountriesDTO {},
  GetStatesByCountryIdDTO: class GetStatesByCountryIdDTO {},
}));

const AddressResolver = require('../address.resolver').default;

describe('AddressResolver', () => {
  const commandBus = { execute: jest.fn() };
  const queryBus = { execute: jest.fn() };
  const input = {
    name: 'Home',
    addressLine1: 'Main Street',
    postalCode: '01001',
    city: 'Guatemala City',
    countryId: 'country-1',
    stateId: 'state-1',
    addressType: AddressTypeEnum.SHIPPING,
    deliveryNum: '55555555',
  };

  beforeEach(() => jest.clearAllMocks());

  it('uses the authenticated customer identity when creating a customer address', async () => {
    const resolver = new AddressResolver(
      commandBus as unknown as CommandBus,
      queryBus as unknown as QueryBus,
    );
    const result = { id: 'address-1' };
    commandBus.execute.mockResolvedValue(result);

    await expect(
      resolver.createAddress(input, {
        email: 'customer@example.com',
        authIdentityId: 'identity-1',
        tenantId: 'tenant-1',
        customerId: 'customer-1',
      }),
    ).resolves.toBe(result);

    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          ...input,
          tenantId: 'tenant-1',
          customerId: 'customer-1',
        },
      }),
    );
  });

  it('creates a tenant address without a customer owner', async () => {
    const resolver = new AddressResolver(
      commandBus as unknown as CommandBus,
      queryBus as unknown as QueryBus,
    );

    await resolver.createAddress(input, {
      email: 'tenant@example.com',
      authIdentityId: 'identity-1',
      tenantId: 'tenant-1',
    });

    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          ...input,
          tenantId: 'tenant-1',
          customerId: undefined,
        },
      }),
    );
  });
});
