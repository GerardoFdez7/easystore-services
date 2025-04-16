import { Resolver } from '@nestjs/graphql';
import { CommandBus } from '@nestjs/cqrs';
import { ClientType } from './types/client.type';

@Resolver(() => ClientType)
export class ClientResolver {
  constructor(private commandBus: CommandBus) {}
}
