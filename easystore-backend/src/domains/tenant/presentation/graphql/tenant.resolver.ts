import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FindTenantByBusinessNameDTO } from '../../application/queries';
import { TenantSingUpDTO } from '../../application/commands';
import { TenantType, CreateTenantInput } from './tenant.types';

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
    @Args('input') input: CreateTenantInput,
  ): Promise<boolean> {
    await this.commandBus.execute(new TenantSingUpDTO({ ...input }));
    return true;
  }

  ///////////////
  //  Queries  //
  ///////////////

  @Query(() => TenantType, { nullable: true })
  async findTenantByBusinessName(
    @Args('businessName') businessName: string,
  ): Promise<TenantType | null> {
    return await this.queryBus.execute(
      new FindTenantByBusinessNameDTO(businessName),
    );
  }
}
