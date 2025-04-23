import { Command } from '@nestjs/cqrs';
import { OrderDto } from '@modules/orders/interfaces/graphql/dto/order.dto';
import { RESULT_TYPE_SYMBOL } from '@nestjs/cqrs/dist/classes/constants';

export class CreateOrderCommand implements Command<OrderDto> {
  readonly [RESULT_TYPE_SYMBOL]: OrderDto;

  constructor(
    public readonly userId: number,
    public readonly cartId: string,
    public readonly addressId: string,
  ) {}
}
