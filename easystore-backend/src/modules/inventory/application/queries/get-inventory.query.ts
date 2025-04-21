import { Query } from '@nestjs/cqrs';
import { InventoryDto } from '@modules/inventory/interfaces/graphql/dto/inventory.dto';
import { RESULT_TYPE_SYMBOL } from '@nestjs/cqrs/dist/classes/constants';

const queryResultType: unique symbol = Symbol('nestjs-query-result-type');

export class GetInventoryQuery implements Query<InventoryDto> {
  static readonly QUERY_RESULT_TYPE = queryResultType;
  readonly [queryResultType]: InventoryDto;

  constructor(
    public readonly productId: string,
    public readonly warehouseId?: number,
  ) {}
  [RESULT_TYPE_SYMBOL]: InventoryDto;
}
