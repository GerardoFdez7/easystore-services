/* eslint-disable @typescript-eslint/unbound-method */
import { EventPublisher } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { ProductMapper } from '../../../../../mappers';
import { DeleteVariantDTO } from '../delete-variant.dto';
import { DeleteVariantHandler } from '../delete-variant.handler';

describe('DeleteVariantHandler', () => {
  const variantId = '0198b746-8c72-7a2f-9c31-6d4f9866f323';
  const productId = '0198b746-8c72-7a2f-9c31-6d4f9866f321';
  const tenantId = '0198b746-8c72-7a2f-9c31-6d4f9866f322';
  const product = { id: productId };
  const updatedProduct = { commit: jest.fn() };
  const dto = { id: productId };
  const repository = { findById: jest.fn(), update: jest.fn() };
  const publisher = { mergeObjectContext: jest.fn() };
  const command = new DeleteVariantDTO(variantId, productId, tenantId);
  let handler: DeleteVariantHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new DeleteVariantHandler(
      repository as never,
      publisher as unknown as EventPublisher,
    );
    repository.findById.mockResolvedValue(product);
    jest
      .spyOn(ProductMapper, 'fromRemoveVariantDto')
      .mockReturnValue(updatedProduct as never);
    jest.spyOn(ProductMapper, 'toDto').mockReturnValue(dto as never);
    publisher.mergeObjectContext.mockReturnValue(updatedProduct);
  });

  it('permanently removes a variant from its tenant-scoped product aggregate', async () => {
    await expect(handler.execute(command)).resolves.toBe(dto);

    expect(repository.findById).toHaveBeenCalledWith(
      expect.objectContaining({ value: tenantId }),
      expect.objectContaining({ value: productId }),
    );
    expect(ProductMapper.fromRemoveVariantDto).toHaveBeenCalledWith(
      product,
      variantId,
    );
    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({ value: tenantId }),
      expect.objectContaining({ value: productId }),
      updatedProduct,
    );
    expect(updatedProduct.commit).toHaveBeenCalledTimes(1);
    expect(ProductMapper.toDto).toHaveBeenCalledWith(updatedProduct);
  });

  it('throws a product-specific not-found error before variant mutation', async () => {
    repository.findById.mockResolvedValueOnce(null);

    await expect(handler.execute(command)).rejects.toThrow(
      new NotFoundException(`Product with ID ${productId} not found`),
    );
    expect(ProductMapper.fromRemoveVariantDto).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('propagates a missing variant domain error without persistence', async () => {
    const error = new Error('Variant not found');
    jest
      .spyOn(ProductMapper, 'fromRemoveVariantDto')
      .mockImplementationOnce(() => {
        throw error;
      });

    await expect(handler.execute(command)).rejects.toBe(error);
    expect(repository.update).not.toHaveBeenCalled();
    expect(updatedProduct.commit).not.toHaveBeenCalled();
  });

  it('does not commit when repository persistence fails', async () => {
    const error = new Error('delete conflict');
    repository.update.mockRejectedValueOnce(error);

    await expect(handler.execute(command)).rejects.toBe(error);
    expect(updatedProduct.commit).not.toHaveBeenCalled();
  });
});
