import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  FindClientByBusinessNameQuery,
  FindClientByEmailQuery,
} from './queries/client.query';
import {
  LoginClientCommand,
  RegisterClientCommand,
} from './commands/client.command';

@Resolver()
export class ClientResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  ///////////////
  // Mutations //
  ///////////////

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

  @Mutation(() => Boolean)
  async loginClient(
    @Args('identifier') identifier: string,
    @Args('password') password: string,
  ): Promise<boolean> {
    await this.commandBus.execute(new LoginClientCommand(identifier, password));
    return true;
  }

  ///////////////
  //  Querys   //
  ///////////////

  @Query(() => String, { nullable: true })
  async findClientEmail(
    @Args('email') email: string,
  ): Promise<string | undefined> {
    const client: { email: string } | null = await this.queryBus.execute(
      new FindClientByEmailQuery(email),
    );
    return client?.email;
  }

  @Query(() => String, { nullable: true })
  async findClientBusiness(
    @Args('business') business: string,
  ): Promise<string | undefined> {
    const client: { businessName: string } | null = await this.queryBus.execute(
      new FindClientByBusinessNameQuery(business),
    );
    return client?.businessName;
  }
}
