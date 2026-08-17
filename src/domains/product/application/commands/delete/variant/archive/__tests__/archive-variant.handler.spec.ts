/* eslint-disable @typescript-eslint/unbound-method */
import { EventPublisher } from '@nestjs/cqrs';
import { ProductMapper } from '../../../../../mappers';
import { findProductOrThrow } from '../../../../shared/find-product-or-throw';
import { ArchiveVariantDTO } from '../archive-variant.dto';
import { ArchiveVariantHandler } from '../archive-variant.handler';

jest.mock('../../../../shared/find-product-or-throw', () => ({
  findProductOrThrow: jest.fn(),
}));

describe('ArchiveVariantHandler', () => {
  const variantId = '0198b746-8c72-7a2f-9c31-6d4f9866f323';
  const productId = '0198b746-8c72-7a2f-9c31-6d4f9866f321';
  const tenantId = '0198b746-8c72-7a2f-9c31-6d4f9866f322';
  const product = { id: productId };
  const archivedProduct = { commit: jest.fn() };
  const dto = { id: productId };
  const repository = { update: jest.fn() };
  const publisher = { mergeObjectContext: jest.fn() };
  const command = new ArchiveVariantDTO(variantId, productId, tenantId);
  let handler: ArchiveVariantHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new ArchiveVariantHandler(
      repository as never,
      publisher as unknown as EventPublisher,
    );
    (findProductOrThrow as jest.Mock).mockResolvedValue(product);
    jest
      .spyOn(ProductMapper, 'fromArchiveVariantDto')
      .mockReturnValue(archivedProduct as never);
    jest.spyOn(ProductMapper, 'toDto').mockReturnValue(dto as never);
    publisher.mergeObjectContext.mockReturnValue(archivedProduct);
  });

  it('archives the requested variant and persists its product aggregate', async () => {
    await expect(handler.execute(command)).resolves.toBe(dto);

    expect(findProductOrThrow).toHaveBeenCalledWith(
      repository,
      tenantId,
      productId,
    );
    expect(ProductMapper.fromArchiveVariantDto).toHaveBeenCalledWith(
      product,
      variantId,
    );
    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({ value: tenantId }),
      expect.objectContaining({ value: productId }),
      archivedProduct,
    );
    expect(archivedProduct.commit).toHaveBeenCalledTimes(1);
    expect(ProductMapper.toDto).toHaveBeenCalledWith(archivedProduct);
  });

  it('does not mutate or persist when the product is missing', async () => {
    const error = new Error('Product not found');
    (findProductOrThrow as jest.Mock).mockRejectedValueOnce(error);

    await expect(handler.execute(command)).rejects.toBe(error);
    expect(ProductMapper.fromArchiveVariantDto).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('propagates a missing/already archived variant domain error without persistence', async () => {
    const error = new Error('Variant cannot be archived');
    jest
      .spyOn(ProductMapper, 'fromArchiveVariantDto')
      .mockImplementationOnce(() => {
        throw error;
      });

    await expect(handler.execute(command)).rejects.toBe(error);
    expect(repository.update).not.toHaveBeenCalled();
    expect(archivedProduct.commit).not.toHaveBeenCalled();
  });

  it('does not commit when aggregate persistence fails', async () => {
    const error = new Error('concurrent update');
    repository.update.mockRejectedValueOnce(error);

    await expect(handler.execute(command)).rejects.toBe(error);
    expect(archivedProduct.commit).not.toHaveBeenCalled();
  });
});
