import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateCartDto } from './create-cart.dto';
import { ICartRepository } from 'src/domains/cart/aggregates/repositories/cart.interface';
import { CartDTO, CartMapper } from '../../../mappers';
import { Cart } from 'src/domains/cart/aggregates/entities/cart.entity';

@CommandHandler(CreateCartDto)
export class CartCreateHandler implements ICommandHandler<CreateCartDto> {
  constructor(
    @Inject('ICartRepository')
    private readonly cartRepository: ICartRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateCartDto): Promise<CartDTO> {
    // Merge with event publisher context for domain events
    const cartWithEvents = this.eventPublisher.mergeObjectContext(
      Cart.create(command.data),
    );

    // Persist the cart to the repository
    const savedCart = await this.cartRepository.create(cartWithEvents);

    // Commit domain events
    savedCart.commit();

    // Return the DTO representation
    return CartMapper.toDto(savedCart);
  }
}
