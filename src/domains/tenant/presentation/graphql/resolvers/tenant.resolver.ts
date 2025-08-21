import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { TenantType, UpdateTenantInput } from '../types/tenant.types';
import { UpdateTenantDTO } from '../../../application/commands/update/update-tenant.dto';
import { GetTenantByIdDTO } from '../../../application/queries/get-tenant/get-tenant-by-id.dto';
import { CurrentUser, JwtPayload } from '@common/decorators';

@Resolver(() => TenantType)
export class TenantResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Mutation(() => TenantType)
  async updateTenant(
    @Args('id') id: string,
    @Args('input') input: UpdateTenantInput,
  ): Promise<TenantType> {
    const command = new UpdateTenantDTO(id, {
      ownerName: input.ownerName,
      businessName: input.businessName,
      domain: input.domain,
      logo: input.logo,
      description: input.description,
      currency: input.currency,
    });

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
