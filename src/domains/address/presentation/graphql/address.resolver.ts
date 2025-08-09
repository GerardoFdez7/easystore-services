import { Resolver, Mutation, Args, ID, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '@authentication/infrastructure/decorators/current-user.decorator';
import { JwtPayload } from '@authentication/infrastructure/jwt/jwt-handler';
import AuthGuard from '@authentication/infrastructure/guard/auth.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  AddressType,
  CreateAddressInput,
  UpdateAddressInput,
  AddressesType,
} from './types';
import {
  CreateAddressDTO,
  AddressDeleteDTO,
  UpdateAddressDTO,
} from '../../application/commands';
import { GetAddressIdDto, GetAllAddressesDTO } from '../../application/queries';
import { AddressTypeEnum } from '../../aggregates/value-objects';

@Resolver(() => AddressType)
@UseGuards(AuthGuard)
export default class AddressResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  ///////////////
  // Mutations //
  ///////////////

  @Mutation(() => AddressType)
  async createAddress(
    @Args('input', { type: () => CreateAddressInput })
    input: CreateAddressInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<AddressType> {
    const inputWithTenantId = { ...input, tenantId: user.tenantId };
    return this.commandBus.execute(new CreateAddressDTO(inputWithTenantId));
  }

  @Mutation(() => AddressType)
  async updateAddress(
    @Args('id', { type: () => ID }) id: string,
    @Args('input', { type: () => UpdateAddressInput })
    input: UpdateAddressInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<AddressType> {
    return this.commandBus.execute(
      new UpdateAddressDTO(id, user.tenantId, user.customerId, input),
    );
  }

  @Mutation(() => AddressType)
  async deleteAddress(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<AddressType> {
    return this.commandBus.execute(
      new AddressDeleteDTO(id, user.tenantId, user.customerId),
    );
  }

  ///////////////
  // Queries //
  ///////////////

  @Query(() => AddressType)
  async getAddressById(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<AddressType> {
    return this.queryBus.execute(
      new GetAddressIdDto(id, user.tenantId, user.customerId),
    );
  }

  @Query(() => AddressesType)
  async getAllAddresses(
    @CurrentUser()
    user: JwtPayload,
    @Args('addressType', { type: () => AddressTypeEnum, nullable: true })
    addressType?: AddressTypeEnum,
  ): Promise<AddressesType> {
    return this.queryBus.execute(
      new GetAllAddressesDTO(user.tenantId, user.customerId, { addressType }),
    );
  }
}
