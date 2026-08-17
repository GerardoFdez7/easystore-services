/* eslint-disable @typescript-eslint/unbound-method */
import { EventPublisher } from '@nestjs/cqrs';
import { ProductMapper } from '../../../../mappers';
import { findProductOrThrow } from '../../../shared/find-product-or-throw';
import { RestoreVariantDTO } from '../restore-variant.dto';
import { RestoreVariantHandler } from '../restore-variant.handler';

jest.mock('../../../shared/find-product-or-throw', () => ({
  findProductOrThrow: jest.fn(),
}));

describe('RestoreVariantHandler', () => {
  const variantId = '0198b746-8c72-7a2f-9c31-6d4f9866f323';
  const productId = '0198b746-8c72-7a2f-9c31-6d4f9866f321';
  const tenantId = '0198b746-8c72-7a2f-9c31-6d4f9866f322';
  const product = { id: productId };
  const restoredProduct = { commit: jest.fn() };
  const dto = { id: productId };
  const repository = { update: jest.fn() };
  const publisher = { mergeObjectContext: jest.fn() };
  const command = new RestoreVariantDTO(variantId, productId, tenantId);
  let handler: RestoreVariantHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new RestoreVariantHandler(
      repository as never,
      publisher as unknown as EventPublisher,
    );
    (findProductOrThrow as jest.Mock).mockResolvedValue(product);
    jest
      .spyOn(ProductMapper, 'fromRestoreVariantDto')
      .mockReturnValue(restoredProduct as never);
    jest.spyOn(ProductMapper, 'toDto').mockReturnValue(dto as never);
    publisher.mergeObjectContext.mockReturnValue(restoredProduct);
  });

  it('finds the product while displaying the variant ID in lookup errors', async () => {
    await handler.execute(command);

    expect(findProductOrThrow).toHaveBeenCalledWith(
      repository,
      tenantId,
      productId,
      variantId,
    );
  });

  it('restores the variant, persists the aggregate, commits, and maps it', async () => {
    await expect(handler.execute(command)).resolves.toBe(dto);

    expect(ProductMapper.fromRestoreVariantDto).toHaveBeenCalledWith(
      product,
      variantId,
    );
    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({ value: tenantId }),
      expect.objectContaining({ value: productId }),
      restoredProduct,
    );
    expect(restoredProduct.commit).toHaveBeenCalledTimes(1);
    expect(ProductMapper.toDto).toHaveBeenCalledWith(restoredProduct);
  });

  it('does not restore when product lookup fails', async () => {
    const error = new Error(`Product with ID ${variantId} not found`);
    (findProductOrThrow as jest.Mock).mockRejectedValueOnce(error);

    await expect(handler.execute(command)).rejects.toBe(error);
    expect(ProductMapper.fromRestoreVariantDto).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('does not persist when the variant cannot be restored by the domain', async () => {
    const error = new Error('Variant is not archived');
    jest
      .spyOn(ProductMapper, 'fromRestoreVariantDto')
      .mockImplementationOnce(() => {
        throw error;
      });

    await expect(handler.execute(command)).rejects.toBe(error);
    expect(repository.update).not.toHaveBeenCalled();
    expect(restoredProduct.commit).not.toHaveBeenCalled();
  });

  it('does not commit when aggregate persistence fails', async () => {
    const error = new Error('restore conflict');
    repository.update.mockRejectedValueOnce(error);

    await expect(handler.execute(command)).rejects.toBe(error);
    expect(restoredProduct.commit).not.toHaveBeenCalled();
  });
});
