import { Resolver } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CustomerType } from './types/customer.types';

@Resolver(() => CustomerType)
export class CustomerResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  ///////////////
  // Mutations //
  ///////////////

  ///////////////
  // Queries //
  ///////////////
}
