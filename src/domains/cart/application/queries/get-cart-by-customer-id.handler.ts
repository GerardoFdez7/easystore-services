import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCartByCustomerIdDTO } from './get-cart-by-customer-id.dto';
import { Inject, NotFoundException } from '@nestjs/common';
import { ICartRepository } from '../../aggregates/repositories/cart.interface';
import { CartDTO, CartMapper } from '../mappers';
import { Id } from '@shared/value-objects';

@QueryHandler(GetCartByCustomerIdDTO)
export class GetCartByIdHandler
  implements IQueryHandler<GetCartByCustomerIdDTO>
{
  constructor(
    @Inject('ICartRepository') private readonly cartRepository: ICartRepository,
  ) {}
  async execute(query: GetCartByCustomerIdDTO): Promise<CartDTO> {
    const customerId = Id.create(query.id);
    const cartFound =
      await this.cartRepository.findCartByCustomerId(customerId);
    if (!cartFound)
      throw new NotFoundException(`Cart with ID ${query.id} not found`);
    return CartMapper.toDto(cartFound);
  }
}
