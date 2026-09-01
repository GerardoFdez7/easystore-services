import {
  findTenantCartOrThrow,
  persistCartMutation,
} from '../../../shared/cart-command-helpers';
import { Cart } from '../../../../aggregates/entities/cart/cart.entity';
import { Id } from '../../../../aggregates/value-objects';
import { ICartRepository } from '../../../../aggregates/repositories/cart.interface';
import { CartDTO } from '../../../mappers';
import { ITenantCurrencyAdapter } from '../../../ports';
import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { RemoveManyItemsFromCartDto } from './remove-many-items-from-cart.dto';

@CommandHandler(RemoveManyItemsFromCartDto)
export class RemoveManyItemsFromCartHandler
  implements ICommandHandler<RemoveManyItemsFromCartDto>
{
  constructor(
    @Inject('ICartRepository')
    private readonly cartRepository: ICartRepository,
    private readonly eventPublisher: EventPublisher,
    @Inject('ITenantCurrencyAdapter')
    private readonly tenantCurrencyAdapter: ITenantCurrencyAdapter,
  ) {}

  /**
   * Executes the command to remove multiple items from a cart.
   *
   * @param command - The command containing customerId and array of variantIds to remove
   * @returns Promise<CartDTO> - The updated cart data transfer object
   * @throws NotFoundException - When the cart is not found for the given customer
   */
  async execute(command: RemoveManyItemsFromCartDto): Promise<CartDTO> {
    const cartFound = await findTenantCartOrThrow(
      this.cartRepository,
      command.customerId,
      command.tenantId,
    );

    const variantsIdList = command.data.variantIds.map((variantId) => {
      return Id.create(variantId);
    });

    return persistCartMutation(
      cartFound,
      (cart) => Cart.removeManyItems(cart, variantsIdList),
      this.eventPublisher,
      this.cartRepository,
      command.tenantId,
      this.tenantCurrencyAdapter,
    );
  }
}
