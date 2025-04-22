import { Command } from '@nestjs/cqrs';
import { RESULT_TYPE_SYMBOL } from '@nestjs/cqrs/dist/classes/constants';
import { OrderDto } from '../../interfaces/graphql/dto/order.dto';

export class CreateOrderCommand implements Command<OrderDto> {
  readonly [RESULT_TYPE_SYMBOL]: OrderDto;

  constructor(
    public readonly userId: number,
    public readonly cartId: string,
    public readonly addressId: string,
  ) {}
}
