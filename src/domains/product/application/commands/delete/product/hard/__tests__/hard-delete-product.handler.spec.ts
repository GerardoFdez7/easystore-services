/* eslint-disable @typescript-eslint/unbound-method */
import { EventPublisher } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { ProductMapper } from '../../../../../mappers';
import { HardDeleteProductDTO } from '../hard-delete-product.dto';
import { HardDeleteProductHandler } from '../hard-delete-product.handler';

describe('HardDeleteProductHandler', () => {
  const productId = '0198b746-8c72-7a2f-9c31-6d4f9866f321';
  const tenantId = '0198b746-8c72-7a2f-9c31-6d4f9866f322';
  const product = { id: productId };
  const deletedProduct = { commit: jest.fn() };
  const dto = { id: productId };
  const repository = { hardDelete: jest.fn() };
  const publisher = { mergeObjectContext: jest.fn() };
  const command = new HardDeleteProductDTO(productId, tenantId);
  let handler: HardDeleteProductHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new HardDeleteProductHandler(
      repository as never,
      publisher as unknown as EventPublisher,
    );
    repository.hardDelete.mockResolvedValue(product);
    jest
      .spyOn(ProductMapper, 'fromHardDeleteDto')
      .mockReturnValue(deletedProduct as never);
    jest.spyOn(ProductMapper, 'toDto').mockReturnValue(dto as never);
    publisher.mergeObjectContext.mockReturnValue(deletedProduct);
  });

  it('hard-deletes only the tenant-scoped product and publishes the deletion event', async () => {
    await expect(handler.execute(command)).resolves.toBe(dto);

    expect(repository.hardDelete).toHaveBeenCalledWith(
      expect.objectContaining({ value: tenantId }),
      expect.objectContaining({ value: productId }),
    );
    expect(ProductMapper.fromHardDeleteDto).toHaveBeenCalledWith(product);
    expect(publisher.mergeObjectContext).toHaveBeenCalledWith(deletedProduct);
    expect(deletedProduct.commit).toHaveBeenCalledTimes(1);
    expect(ProductMapper.toDto).toHaveBeenCalledWith(product);
  });

  it('throws a precise not-found error and creates no event when deletion finds nothing', async () => {
    repository.hardDelete.mockResolvedValueOnce(null);

    await expect(handler.execute(command)).rejects.toThrow(
      new NotFoundException(`Product with ID ${productId} not found`),
    );
    expect(ProductMapper.fromHardDeleteDto).not.toHaveBeenCalled();
    expect(deletedProduct.commit).not.toHaveBeenCalled();
  });

  it('propagates repository failures without mapping a response', async () => {
    const error = new Error('foreign-key constraint');
    repository.hardDelete.mockRejectedValueOnce(error);

    await expect(handler.execute(command)).rejects.toBe(error);
    expect(ProductMapper.fromHardDeleteDto).not.toHaveBeenCalled();
    expect(ProductMapper.toDto).not.toHaveBeenCalled();
  });
});
