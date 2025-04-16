import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterClientInput } from './dto/register-client.input';
import { ClientType } from './types/client.type';
import { RegisterClientCommand } from './commands/impl/register-client.command';

@Resolver(() => ClientType)
export class ClientResolver {
  constructor(private commandBus: CommandBus) {}

  @Mutation(() => ClientType)
  async registerClient(
    @Args('input') input: RegisterClientInput,
  ): Promise<ClientType> {
    return this.commandBus.execute(new RegisterClientCommand(input));
  }
}
