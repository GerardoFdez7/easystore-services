/* eslint-disable @typescript-eslint/unbound-method */
import { EventPublisher } from '@nestjs/cqrs';
import { ProductMapper } from '../../../../mappers';
import { findProductOrThrow } from '../../../shared/find-product-or-throw';
import { UpdateProductDTO } from '../update-product.dto';
import { UpdateProductHandler } from '../update-product.handler';

jest.mock('../../../shared/find-product-or-throw', () => ({
  findProductOrThrow: jest.fn(),
}));

describe('UpdateProductHandler', () => {
  const productId = '0198b746-8c72-7a2f-9c31-6d4f9866f321';
  const tenantId = '0198b746-8c72-7a2f-9c31-6d4f9866f322';
  const product = { id: productId };
  const updatedProduct = { commit: jest.fn() };
  const dto = { id: productId, name: 'Updated product' };
  const repository = { update: jest.fn() };
  const publisher = { mergeObjectContext: jest.fn() };
  const command = new UpdateProductDTO(productId, tenantId, {
    name: 'Updated product',
  });
  let handler: UpdateProductHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new UpdateProductHandler(
      repository as never,
      publisher as unknown as EventPublisher,
    );
    (findProductOrThrow as jest.Mock).mockResolvedValue(product);
    jest
      .spyOn(ProductMapper, 'fromUpdateDto')
      .mockReturnValue(updatedProduct as never);
    jest.spyOn(ProductMapper, 'toDto').mockReturnValue(dto as never);
    publisher.mergeObjectContext.mockReturnValue(updatedProduct);
  });

  it('updates a product only within its tenant boundary', async () => {
    await expect(handler.execute(command)).resolves.toBe(dto);

    expect(findProductOrThrow).toHaveBeenCalledWith(
      repository,
      tenantId,
      productId,
    );
    expect(ProductMapper.fromUpdateDto).toHaveBeenCalledWith(product, command);
    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({ value: tenantId }),
      expect.objectContaining({ value: productId }),
      updatedProduct,
    );
    expect(updatedProduct.commit).toHaveBeenCalledTimes(1);
    expect(ProductMapper.toDto).toHaveBeenCalledWith(updatedProduct);
  });

  it('accepts an empty patch and lets the domain preserve current values', async () => {
    const emptyPatch = new UpdateProductDTO(productId, tenantId, {});

    await handler.execute(emptyPatch);

    expect(ProductMapper.fromUpdateDto).toHaveBeenCalledWith(
      product,
      emptyPatch,
    );
    expect(repository.update).toHaveBeenCalledTimes(1);
  });

  it('does not map or persist a missing product', async () => {
    const error = new Error('Product not found');
    (findProductOrThrow as jest.Mock).mockRejectedValueOnce(error);

    await expect(handler.execute(command)).rejects.toBe(error);
    expect(ProductMapper.fromUpdateDto).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('does not persist when domain validation rejects an update', async () => {
    const error = new Error('Invalid product name');
    jest.spyOn(ProductMapper, 'fromUpdateDto').mockImplementationOnce(() => {
      throw error;
    });

    await expect(handler.execute(command)).rejects.toBe(error);
    expect(repository.update).not.toHaveBeenCalled();
    expect(updatedProduct.commit).not.toHaveBeenCalled();
  });

  it('does not commit or map a response when persistence fails', async () => {
    const error = new Error('update conflict');
    repository.update.mockRejectedValueOnce(error);

    await expect(handler.execute(command)).rejects.toBe(error);
    expect(updatedProduct.commit).not.toHaveBeenCalled();
    expect(ProductMapper.toDto).not.toHaveBeenCalled();
  });
});
