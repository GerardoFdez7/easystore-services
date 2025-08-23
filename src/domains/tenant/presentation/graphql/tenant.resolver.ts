import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { TenantType, UpdateTenantInput } from './types/tenant.types';
import { UpdateTenantDTO } from '../../application/commands';
import { GetTenantByIdDTO } from '../../application/queries';
import { CurrentUser, JwtPayload } from '@common/decorators';

@Resolver(() => TenantType)
export default class TenantResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Mutation(() => TenantType)
  async updateTenant(
    @CurrentUser() user: JwtPayload,
    @Args('input') input: UpdateTenantInput,
  ): Promise<TenantType> {
    const command = new UpdateTenantDTO(user.tenantId, { ...input });

    return this.commandBus.execute(command);
  }

  ///////////////
  //  Queries  //
  ///////////////

  @Query(() => TenantType)
  async getTenantById(@CurrentUser() user: JwtPayload): Promise<TenantType> {
    return this.queryBus.execute(new GetTenantByIdDTO(user.tenantId));
  }
}
