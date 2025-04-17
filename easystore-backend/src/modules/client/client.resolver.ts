import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RegisterClientCommand } from './commands/dto/register-client.command';
import { FindClientByEmailQuery } from './queries/dto/find-client-by-email.query';

@Resolver()
export class ClientResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Mutation(() => Boolean)
  async registerClient(
    @Args('businessName') businessName: string,
    @Args('ownerName') ownerName: string,
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<boolean> {
    await this.commandBus.execute(
      new RegisterClientCommand(businessName, ownerName, email, password),
    );
    return true;
  }

  @Query(() => String, { nullable: true })
  async findClientEmail(
    @Args('email') email: string,
  ): Promise<string | undefined> {
    const client: { email: string } | null = await this.queryBus.execute(
      new FindClientByEmailQuery(email),
    );
    return client?.email;
  }
}
