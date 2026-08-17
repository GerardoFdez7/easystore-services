/* eslint-disable @typescript-eslint/unbound-method */
import { EventPublisher } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductMapper } from '../../../../mappers';
import { TypeEnum } from '../../../../../aggregates/value-objects';
import { UpdateVariantDTO } from '../update-variant.dto';
import { UpdateVariantHandler } from '../update-variant.handler';

describe('UpdateVariantHandler', () => {
  const variantId = '0198b746-8c72-7a2f-9c31-6d4f9866f323';
  const productId = '0198b746-8c72-7a2f-9c31-6d4f9866f321';
  const tenantId = '0198b746-8c72-7a2f-9c31-6d4f9866f322';
  const productType = { getValue: jest.fn() };
  const product = { get: jest.fn((): typeof productType => productType) };
  const updatedProduct = { commit: jest.fn() };
  const dto = { id: productId };
  const repository = { findById: jest.fn(), update: jest.fn() };
  const publisher = { mergeObjectContext: jest.fn() };
  let handler: UpdateVariantHandler;

  const command = (data: Record<string, unknown>): UpdateVariantDTO =>
    new UpdateVariantDTO(variantId, productId, tenantId, data as never);

  beforeEach(() => {
    jest.clearAllMocks();
    productType.getValue.mockReturnValue(TypeEnum.PHYSICAL);
    handler = new UpdateVariantHandler(
      repository as never,
      publisher as unknown as EventPublisher,
    );
    repository.findById.mockResolvedValue(product);
    jest
      .spyOn(ProductMapper, 'fromUpdateVariantDto')
      .mockReturnValue(updatedProduct as never);
    jest.spyOn(ProductMapper, 'toDto').mockReturnValue(dto as never);
    publisher.mergeObjectContext.mockReturnValue(updatedProduct);
  });

  it('rejects a missing tenant-scoped product before inspecting update data', async () => {
    repository.findById.mockResolvedValueOnce(null);

    await expect(handler.execute(command({ sku: 'SKU-2' }))).rejects.toThrow(
      new NotFoundException(`Product with ID ${productId} not found`),
    );
    expect(ProductMapper.fromUpdateVariantDto).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it.each([
    ['weight', { weight: 1 }],
    ['dimensions', { dimension: { height: 1 } }],
  ])('rejects %s for a digital product variant', async (_field, data) => {
    productType.getValue.mockReturnValueOnce(TypeEnum.DIGITAL);

    await expect(handler.execute(command(data))).rejects.toThrow(
      new BadRequestException(
        'Digital products cannot have weight or dimensions.',
      ),
    );
    expect(repository.update).not.toHaveBeenCalled();
  });

  it.each([
    ['weight', { weight: 0 }, 'Weight'],
    ['height', { dimension: { height: 0 } }, 'Dimension height'],
    ['width', { dimension: { width: -1 } }, 'Dimension width'],
    ['length', { dimension: { length: 0 } }, 'Dimension length'],
  ])(
    'rejects a non-positive physical %s',
    async (_field, data, messagePrefix) => {
      await expect(handler.execute(command(data))).rejects.toThrow(
        `${messagePrefix} must be a positive value for physical products.`,
      );
      expect(ProductMapper.fromUpdateVariantDto).not.toHaveBeenCalled();
      expect(repository.update).not.toHaveBeenCalled();
    },
  );

  it.each([
    [TypeEnum.DIGITAL, { sku: 'DIGITAL-2', weight: undefined }],
    [
      TypeEnum.PHYSICAL,
      { weight: 0.1, dimension: { height: 1, width: 2, length: 3 } },
    ],
    [TypeEnum.PHYSICAL, { sku: 'PHYSICAL-2' }],
  ])('persists a valid %s variant patch', async (type, data) => {
    productType.getValue.mockReturnValueOnce(type);
    const updateCommand = command(data);

    await expect(handler.execute(updateCommand)).resolves.toBe(dto);

    expect(ProductMapper.fromUpdateVariantDto).toHaveBeenCalledWith(
      product,
      variantId,
      updateCommand,
    );
    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({ value: tenantId }),
      expect.objectContaining({ value: productId }),
      updatedProduct,
    );
    expect(updatedProduct.commit).toHaveBeenCalledTimes(1);
    expect(ProductMapper.toDto).toHaveBeenCalledWith(updatedProduct);
  });

  it('does not persist when the domain rejects a missing variant', async () => {
    const error = new Error('Variant not found');
    jest
      .spyOn(ProductMapper, 'fromUpdateVariantDto')
      .mockImplementationOnce(() => {
        throw error;
      });

    await expect(handler.execute(command({ sku: 'SKU-2' }))).rejects.toBe(
      error,
    );
    expect(repository.update).not.toHaveBeenCalled();
    expect(updatedProduct.commit).not.toHaveBeenCalled();
  });

  it('does not commit when persistence fails', async () => {
    const error = new Error('variant update conflict');
    repository.update.mockRejectedValueOnce(error);

    await expect(handler.execute(command({ sku: 'SKU-2' }))).rejects.toBe(
      error,
    );
    expect(updatedProduct.commit).not.toHaveBeenCalled();
    expect(ProductMapper.toDto).not.toHaveBeenCalled();
  });
});
