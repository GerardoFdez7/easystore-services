import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CommandBus } from '@nestjs/cqrs';
import { TenantType, UpdateTenantInput } from '../types/tenant.types';
import { UpdateTenantDTO } from '../../../application/commands/update/update-tenant.dto';

@Resolver(() => TenantType)
export class TenantResolver {
  constructor(private readonly commandBus: CommandBus) {}

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
}
