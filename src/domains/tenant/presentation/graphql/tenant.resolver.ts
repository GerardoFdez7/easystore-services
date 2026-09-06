import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { TenantType, UpdateTenantInput } from './types/tenant.types';
import { UpdateTenantDTO } from '../../application/commands';
import { GetTenantByIdDTO } from '../../application/queries';
import {
  CurrentUser,
  JwtPayload,
  AllowAccountTypes,
  RequirePermission,
} from '@shared/presentation/decorators';
import {
  FeatureEnum,
  PermissionActionEnum,
  AccountTypeEnum,
} from '@shared/aggregates/value-objects';
import { TenantDTO } from '../../application/mappers';

@Resolver(() => TenantType)
export default class TenantResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @AllowAccountTypes(AccountTypeEnum.TENANT)
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

  @RequirePermission(FeatureEnum.SETTINGS, PermissionActionEnum.VIEW)
  @Query(() => TenantType)
  async getTenantById(@CurrentUser() user: JwtPayload): Promise<TenantType> {
    const tenant: TenantDTO = await this.queryBus.execute(
      new GetTenantByIdDTO(user.tenantId),
    );
    return {
      ...tenant,
      email: user.email,
    } as TenantType;
  }
}
