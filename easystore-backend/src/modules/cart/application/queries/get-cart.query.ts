import { RESULT_TYPE_SYMBOL } from '@nestjs/cqrs/dist/classes/constants';
import { CartDto } from '@modules/cart/interfaces/graphql/dto/cart.dto';

export class GetCartQuery {
  readonly [RESULT_TYPE_SYMBOL]: CartDto;
  constructor(public readonly userId: number) {}
}
