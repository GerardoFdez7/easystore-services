import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { RemoveItemFromCartDto } from './remove-item-from-cart.dto';
import { CartDTO } from '../../../mappers';
import { Inject, Optional } from '@nestjs/common';
import { ICartRepository } from '../../../../aggregates/repositories/cart.interface';
import { Id } from '../../../../aggregates/value-objects';
import { Cart } from '../../../../aggregates/entities/cart/cart.entity';
import { ITenantCurrencyAdapter } from '../../../ports';
import {
  findTenantCartOrThrow,
  persistCartMutation,
} from '../../../shared/cart-command-helpers';

@CommandHandler(RemoveItemFromCartDto)
export class RemoveItemFromCartHandler
  implements ICommandHandler<RemoveItemFromCartDto>
{
  constructor(
    @Inject('ICartRepository') private readonly cartRepository: ICartRepository,
    private readonly eventPublisher: EventPublisher,
    @Optional()
    @Inject('ITenantCurrencyAdapter')
    private readonly tenantCurrencyAdapter?: ITenantCurrencyAdapter,
  ) {}

  async execute(command: RemoveItemFromCartDto): Promise<CartDTO> {
    const variantId = Id.create(command.data.variantId);
    const cartFound = await findTenantCartOrThrow(
      this.cartRepository,
      command.customerId,
      command.tenantId,
    );

    return persistCartMutation(
      cartFound,
      (cart) => Cart.removeItem(cart, variantId),
      this.eventPublisher,
      this.cartRepository,
      command.tenantId,
      this.tenantCurrencyAdapter,
    );
  }
}
