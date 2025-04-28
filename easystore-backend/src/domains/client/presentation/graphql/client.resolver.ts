import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FindClientByBusinessNameDTO } from '../../aplication/queries/get-businessname/businessname.dto';
import { FindClientByEmailDTO } from '../../aplication/queries/get-email/email.dto';
import { LoginClientDTO } from '../../aplication/queries/login/login.dto';
import { RegisterClientDTO } from '../../aplication/commands/create/register.dto';
import { ClientType } from './client.type';

@Resolver(() => ClientType)
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
      new RegisterClientDTO(businessName, ownerName, email, password),
    );
    return true;
  }

  ///////////////
  //  Queries  //
  ///////////////

  @Query(() => ClientType, { nullable: true })
  async findClientByEmail(
    @Args('email') email: string,
  ): Promise<ClientType | null> {
    return await this.queryBus.execute(new FindClientByEmailDTO(email));
  }

  @Query(() => ClientType, { nullable: true })
  async findClientByBusiness(
    @Args('business') business: string,
  ): Promise<ClientType | null> {
    return await this.queryBus.execute(
      new FindClientByBusinessNameDTO(business),
    );
  }

  @Query(() => Boolean)
  async loginClient(
    @Args('identifier') identifier: string,
    @Args('password') password: string,
  ): Promise<boolean> {
    return await this.queryBus.execute(
      new LoginClientDTO(identifier, password),
    );
  }
}
