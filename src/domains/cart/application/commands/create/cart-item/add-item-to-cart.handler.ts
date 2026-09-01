import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { AddItemToCartDto } from './add-item-to-cart.dto';
import { Inject, NotFoundException, Optional } from '@nestjs/common';
import { ICartRepository } from '../../../../aggregates/repositories/cart.interface';
import { CartDTO, CartMapper } from '../../../mappers';
import { Cart } from '../../../../aggregates/entities/cart/cart.entity';
import { CartItem } from '../../../../aggregates/value-objects';
import { IProductAdapter, ITenantCurrencyAdapter } from '../../../ports';
import {
  findTenantCartOrThrow,
  withTenantCurrency,
} from '../../../shared/cart-command-helpers';

@CommandHandler(AddItemToCartDto)
export class AddItemToCartHandler implements ICommandHandler<AddItemToCartDto> {
  constructor(
    @Inject('ICartRepository')
    private readonly cartRepository: ICartRepository,
    private readonly eventPublisher: EventPublisher,
    @Optional()
    @Inject('IProductAdapter')
    private readonly productAdapter?: IProductAdapter,
    @Optional()
    @Inject('ITenantCurrencyAdapter')
    private readonly tenantCurrencyAdapter?: ITenantCurrencyAdapter,
  ) {}

  async execute(command: AddItemToCartDto): Promise<CartDTO> {
    const { variantId, promotionId } = command.data;

    const cartFound = await findTenantCartOrThrow(
      this.cartRepository,
      command.customerId,
      command.tenantId ?? '',
    );

    const variants = this.productAdapter
      ? await this.productAdapter.getVariantsDetails(
          [variantId],
          command.tenantId ?? '',
        )
      : undefined;

    if (variants && variants.length !== 1) {
      throw new NotFoundException('Variant not found');
    }

    // Cart Item object
    const cartItem = CartItem.create({
      qty: 1,
      variantId,
      promotionId: promotionId || null,
    });

    const cartWithEvents = this.eventPublisher.mergeObjectContext(
      Cart.addItemToCart(cartFound, cartItem),
    );

    // Persist the cart to the repository
    const cartUpdated = await this.cartRepository.update(cartWithEvents);

    // Commit domain events
    cartWithEvents.commit();

    const dto = variants
      ? CartMapper.toDto(cartUpdated, variants)
      : CartMapper.toDto(cartUpdated);
    return withTenantCurrency(
      dto,
      command.tenantId,
      this.tenantCurrencyAdapter,
    );
  }
}
