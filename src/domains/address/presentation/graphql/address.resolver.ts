import { Resolver, Mutation, Args, ID, Query } from '@nestjs/graphql';
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
import { GetAddressIdDto, GetAllAddressDTO } from '../../application/queries';
import { AddressTypes } from '.prisma/postgres';

@Resolver()
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
  ): Promise<AddressType> {
    return this.commandBus.execute(new CreateAddressDTO(input));
  }

  @Mutation(() => AddressType)
  async updateAddress(
    @Args('id', { type: () => ID }) id: string,
    @Args('input', { type: () => UpdateAddressInput })
    input: UpdateAddressInput,
    @Args('tenantId', { type: () => ID, nullable: true }) tenantId?: string,
    @Args('customerId', { type: () => ID, nullable: true }) customerId?: string,
  ): Promise<AddressType> {
    return this.commandBus.execute(
      new UpdateAddressDTO(id, tenantId, customerId, input),
    );
  }

  @Mutation(() => AddressType)
  async deleteAddress(
    @Args('id', { type: () => ID }) id: string,
    @Args('tenantId', { type: () => ID, nullable: true }) tenantId?: string,
    @Args('customerId', { type: () => ID, nullable: true }) customerId?: string,
  ): Promise<AddressType> {
    return this.commandBus.execute(
      new AddressDeleteDTO(id, tenantId, customerId),
    );
  }

  ///////////////
  // Queries //
  ///////////////

  @Query(() => AddressType)
  async getAddressById(
    @Args('id', { type: () => ID }) id: string,
    @Args('tenantId', { type: () => ID, nullable: true }) tenantId?: string,
    @Args('customerId', { type: () => ID, nullable: true }) customerId?: string,
  ): Promise<AddressType> {
    return this.queryBus.execute(new GetAddressIdDto(id, tenantId, customerId));
  }

  @Query(() => AddressesType)
  async getAllAddress(
    @Args('addressType', { type: () => AddressTypes, nullable: true })
    addressType?: AddressTypes,
    @Args('tenantId', { type: () => ID, nullable: true }) tenantId?: string,
    @Args('customerId', { type: () => ID, nullable: true }) customerId?: string,
  ): Promise<AddressesType> {
    return this.queryBus.execute(
      new GetAllAddressDTO(tenantId, customerId, { addressType }),
    );
  }
}
