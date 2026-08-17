/* eslint-disable @typescript-eslint/unbound-method */
import { EventPublisher } from '@nestjs/cqrs';
import { findAddressOrThrow } from '../../../address-owner';
import { AddressMapper } from '../../../mappers';
import { AddressDeleteDTO } from '../delete-address.dto';
import { DeleteAddressHandler } from '../delete-address.handler';

jest.mock('../../../address-owner', () => ({ findAddressOrThrow: jest.fn() }));

describe('DeleteAddressHandler', () => {
  const originalAddress = { id: 'address-1' };
  const deletedAddress = { commit: jest.fn() };
  const dto = { id: 'address-1' };
  const addressId = { value: 'address-1' };
  const owner = { value: 'tenant-1' };
  const repository = { delete: jest.fn() };
  const publisher = { mergeObjectContext: jest.fn() };
  let handler: DeleteAddressHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new DeleteAddressHandler(
      repository as never,
      publisher as unknown as EventPublisher,
    );
    (findAddressOrThrow as jest.Mock).mockResolvedValue({
      address: originalAddress,
      addressId,
      owner,
    } as never);
    jest
      .spyOn(AddressMapper, 'fromDeleteDto')
      .mockReturnValue(deletedAddress as never);
    jest.spyOn(AddressMapper, 'toDto').mockReturnValue(dto as never);
    publisher.mergeObjectContext.mockReturnValue(deletedAddress);
  });

  it('resolves the owner, deletes the address, commits, and returns the original DTO', async () => {
    const command = new AddressDeleteDTO('address-1', 'tenant-1');

    await expect(handler.execute(command)).resolves.toBe(dto);

    expect(findAddressOrThrow).toHaveBeenCalledWith(
      repository,
      'address-1',
      'tenant-1',
      undefined,
    );
    expect(AddressMapper.fromDeleteDto).toHaveBeenCalledWith(originalAddress);
    expect(repository.delete).toHaveBeenCalledWith(addressId, owner);
    expect(deletedAddress.commit).toHaveBeenCalledTimes(1);
    expect(AddressMapper.toDto).toHaveBeenCalledWith(originalAddress);
  });

  it('stops before deletion when the address or owner cannot be resolved', async () => {
    const error = new Error('Address not found');
    (findAddressOrThrow as jest.Mock).mockRejectedValueOnce(error);

    await expect(
      handler.execute(new AddressDeleteDTO('missing', undefined, 'customer-1')),
    ).rejects.toBe(error);
    expect(repository.delete).not.toHaveBeenCalled();
    expect(deletedAddress.commit).not.toHaveBeenCalled();
  });

  it('does not publish a deletion event when repository deletion fails', async () => {
    const error = new Error('delete failed');
    repository.delete.mockRejectedValueOnce(error);

    await expect(
      handler.execute(new AddressDeleteDTO('address-1', 'tenant-1')),
    ).rejects.toBe(error);
    expect(deletedAddress.commit).not.toHaveBeenCalled();
    expect(AddressMapper.toDto).not.toHaveBeenCalled();
  });
});
