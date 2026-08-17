/* eslint-disable @typescript-eslint/unbound-method */
import { EventPublisher } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { ProductMapper } from '../../../../../mappers';
import { findProductOrThrow } from '../../../../shared/find-product-or-throw';
import { SoftDeleteProductDTO } from '../soft-delete-product.dto';
import { SoftDeleteProductHandler } from '../soft-delete-product.handler';

jest.mock('../../../../shared/find-product-or-throw', () => ({
  findProductOrThrow: jest.fn(),
}));

describe('SoftDeleteProductHandler', () => {
  const productId = '0198b746-8c72-7a2f-9c31-6d4f9866f321';
  const tenantId = '0198b746-8c72-7a2f-9c31-6d4f9866f322';
  const product = { get: jest.fn() };
  const archivedProduct = { commit: jest.fn() };
  const dto = { id: productId, isArchived: true };
  const repository = { update: jest.fn() };
  const publisher = { mergeObjectContext: jest.fn() };
  const command = new SoftDeleteProductDTO(productId, tenantId);
  let handler: SoftDeleteProductHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    product.get.mockReturnValue(false);
    handler = new SoftDeleteProductHandler(
      repository as never,
      publisher as unknown as EventPublisher,
    );
    (findProductOrThrow as jest.Mock).mockResolvedValue(product);
    jest
      .spyOn(ProductMapper, 'fromSoftDeleteDto')
      .mockReturnValue(archivedProduct as never);
    jest.spyOn(ProductMapper, 'toDto').mockReturnValue(dto as never);
    publisher.mergeObjectContext.mockReturnValue(archivedProduct);
  });

  it('archives and persists a live tenant-scoped product', async () => {
    await expect(handler.execute(command)).resolves.toBe(dto);

    expect(findProductOrThrow).toHaveBeenCalledWith(
      repository,
      tenantId,
      productId,
    );
    expect(product.get).toHaveBeenCalledWith('isArchived');
    expect(ProductMapper.fromSoftDeleteDto).toHaveBeenCalledWith(product);
    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({ value: tenantId }),
      expect.objectContaining({ value: productId }),
      archivedProduct,
    );
    expect(archivedProduct.commit).toHaveBeenCalledTimes(1);
    expect(ProductMapper.toDto).toHaveBeenCalledWith(archivedProduct);
  });

  it('rejects repeated soft deletion without writing or emitting another event', async () => {
    product.get.mockReturnValueOnce(true);

    await expect(handler.execute(command)).rejects.toThrow(
      new BadRequestException(
        `Product with ID ${productId} is already soft deleted and cannot be soft deleted again`,
      ),
    );
    expect(ProductMapper.fromSoftDeleteDto).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('does not commit an archive event when persistence fails', async () => {
    const error = new Error('update failed');
    repository.update.mockRejectedValueOnce(error);

    await expect(handler.execute(command)).rejects.toBe(error);
    expect(archivedProduct.commit).not.toHaveBeenCalled();
    expect(ProductMapper.toDto).not.toHaveBeenCalled();
  });
});
