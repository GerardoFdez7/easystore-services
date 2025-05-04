import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FindTenantByBusinessNameDTO } from '../../aplication/queries/get-businessname/businessname.dto';
import { FindTenantByEmailDTO } from '../../aplication/queries/get-email/email.dto';
import { TenantLoginDTO } from '../../aplication/queries/login/login.dto';
import { TenantSingUpDTO } from '../../aplication/commands/create/sing-up.dto';
import { TenantType } from './tenant.type';

@Resolver(() => TenantType)
export class TenantResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  ///////////////
  // Mutations //
  ///////////////

  @Mutation(() => Boolean)
  async TenantSingUp(
    @Args('businessName') businessName: string,
    @Args('ownerName') ownerName: string,
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<boolean> {
    await this.commandBus.execute(
      new TenantSingUpDTO(businessName, ownerName, email, password),
    );
    return true;
  }

  ///////////////
  //  Queries  //
  ///////////////

  @Query(() => TenantType, { nullable: true })
  async findTenantByEmail(
    @Args('email') email: string,
  ): Promise<TenantType | null> {
    return await this.queryBus.execute(new FindTenantByEmailDTO(email));
  }

  @Query(() => TenantType, { nullable: true })
  async findTenantByBusinessName(
    @Args('businessName') businessName: string,
  ): Promise<TenantType | null> {
    return await this.queryBus.execute(
      new FindTenantByBusinessNameDTO(businessName),
    );
  }

  @Query(() => Boolean)
  async loginTenant(
    @Args('id') id: string,
    @Args('password') password: string,
  ): Promise<boolean> {
    return await this.queryBus.execute(new TenantLoginDTO(id, password));
  }
}
