import { ResourceNotFoundError } from '@shared/infrastructure/postgres/errors';
import { Id } from '@shared/aggregates/value-objects';
import { Cart } from '../../../../aggregates/entities/cart/cart.entity';
import { ICartRepository } from '../../../../aggregates/repositories/cart.interface';
import { IProductAdapter } from '../../../ports';
import { GetCartByCustomerIdDTO } from '../get-cart-by-customer-id.dto';
import { GetCartByIdHandler } from '../get-cart-by-customer-id.handler';

describe('GetCartByIdHandler', () => {
  const customerId = '019a039e-fe36-765d-96f1-fe92af9ab188';
  const storeId = '019a039e-fe37-7516-ab6d-c16428949f9f';
  const cart = Cart.reconstitute({
    id: Id.create('019a039e-fe32-747d-aba6-6f3d25bb2864'),
    customerId: Id.create(customerId),
    storeId: Id.create(storeId),
    cartItems: new Map(),
  });

  const cartRepository: jest.Mocked<ICartRepository> = {
    create: jest.fn(),
    update: jest.fn(),
    findCartByCustomerId: jest.fn(),
    getCartItemsCount: jest.fn(),
  };
  const productAdapter: jest.Mocked<IProductAdapter> = {
    getVariantsDetails: jest.fn(),
  };
  const handler = new GetCartByIdHandler(cartRepository, productAdapter);

  beforeEach(() => {
    jest.resetAllMocks();
    cartRepository.findCartByCustomerId.mockResolvedValue(cart);
    cartRepository.getCartItemsCount.mockResolvedValue(0);
  });

  it('loads a cart and its item count within the authenticated store', async () => {
    await handler.execute(
      new GetCartByCustomerIdDTO(customerId, storeId, 1, 20),
    );

    expect(cartRepository.findCartByCustomerId).toHaveBeenCalledWith(
      expect.objectContaining({ getValue: expect.any(Function) }),
      expect.objectContaining({ getValue: expect.any(Function) }),
      1,
      20,
    );
    expect(
      cartRepository.findCartByCustomerId.mock.calls[0][1].getValue(),
    ).toBe(storeId);
    expect(cartRepository.getCartItemsCount).toHaveBeenCalledWith(
      expect.objectContaining({ getValue: expect.any(Function) }),
      expect.objectContaining({ getValue: expect.any(Function) }),
    );
    expect(cartRepository.getCartItemsCount.mock.calls[0][1].getValue()).toBe(
      storeId,
    );
  });

  it('rejects access when no cart exists for the authenticated store', async () => {
    cartRepository.findCartByCustomerId.mockRejectedValue(
      new ResourceNotFoundError('Cart'),
    );

    await expect(
      handler.execute(
        new GetCartByCustomerIdDTO(
          customerId,
          '019a039e-fe38-7759-b843-f9246dfb0a41',
          1,
          20,
        ),
      ),
    ).rejects.toThrow('Cart was not found');
    expect(cartRepository.getCartItemsCount).not.toHaveBeenCalled();
  });
});
