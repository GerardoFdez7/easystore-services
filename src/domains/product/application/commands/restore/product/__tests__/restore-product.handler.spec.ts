/* eslint-disable @typescript-eslint/unbound-method */
import { EventPublisher } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductMapper } from '../../../../mappers';
import { RestoreProductDTO } from '../restore-product.dto';
import { RestoreProductHandler } from '../restore-product.handler';

describe('RestoreProductHandler', () => {
  const productId = '0198b746-8c72-7a2f-9c31-6d4f9866f321';
  const tenantId = '0198b746-8c72-7a2f-9c31-6d4f9866f322';
  const product = { get: jest.fn() };
  const restoredProduct = { commit: jest.fn() };
  const dto = { id: productId, isArchived: false };
  const repository = { findById: jest.fn(), update: jest.fn() };
  const publisher = { mergeObjectContext: jest.fn() };
  const command = new RestoreProductDTO(productId, tenantId);
  let handler: RestoreProductHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    product.get.mockReturnValue(true);
    handler = new RestoreProductHandler(
      repository as never,
      publisher as unknown as EventPublisher,
    );
    repository.findById.mockResolvedValue(product);
    jest
      .spyOn(ProductMapper, 'fromRestoreDto')
      .mockReturnValue(restoredProduct as never);
    jest.spyOn(ProductMapper, 'toDto').mockReturnValue(dto as never);
    publisher.mergeObjectContext.mockReturnValue(restoredProduct);
  });

  it('restores an archived tenant-scoped product and commits its event', async () => {
    await expect(handler.execute(command)).resolves.toBe(dto);

    expect(repository.findById).toHaveBeenCalledWith(
      expect.objectContaining({ value: tenantId }),
      expect.objectContaining({ value: productId }),
    );
    expect(product.get).toHaveBeenCalledWith('isArchived');
    expect(ProductMapper.fromRestoreDto).toHaveBeenCalledWith(product);
    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({ value: tenantId }),
      expect.objectContaining({ value: productId }),
      restoredProduct,
    );
    expect(restoredProduct.commit).toHaveBeenCalledTimes(1);
    expect(ProductMapper.toDto).toHaveBeenCalledWith(restoredProduct);
  });

  it('rejects a missing product before checking archive state', async () => {
    repository.findById.mockResolvedValueOnce(null);

    await expect(handler.execute(command)).rejects.toThrow(
      new NotFoundException(`Product with ID ${productId} not found`),
    );
    expect(product.get).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('rejects restoring an active product without writing', async () => {
    product.get.mockReturnValueOnce(false);

    await expect(handler.execute(command)).rejects.toThrow(
      new BadRequestException(
        `Product with ID ${productId} is not in a deleted state and cannot be restored`,
      ),
    );
    expect(ProductMapper.fromRestoreDto).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('does not commit restoration when persistence fails', async () => {
    const error = new Error('restore conflict');
    repository.update.mockRejectedValueOnce(error);

    await expect(handler.execute(command)).rejects.toBe(error);
    expect(restoredProduct.commit).not.toHaveBeenCalled();
  });
});
