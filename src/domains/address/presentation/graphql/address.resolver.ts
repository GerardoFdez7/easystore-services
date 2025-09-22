import { Resolver, Mutation, Args, ID, Query, Int } from '@nestjs/graphql';
import { CurrentUser, JwtPayload } from '@common/decorators';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  AddressType,
  CreateAddressInput,
  UpdateAddressInput,
  PaginatedAddressesType,
  CountryType,
  StateType,
} from './types';
import {
  CreateAddressDTO,
  AddressDeleteDTO,
  UpdateAddressDTO,
} from '../../application/commands';
import {
  GetAddressIdDto,
  GetAllAddressesDTO,
  GetAllCountriesDTO,
  GetStatesByCountryIdDTO,
} from '../../application/queries';
import { AddressTypeEnum } from '../../aggregates/value-objects';

@Resolver(() => AddressType)
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

  @Query(() => PaginatedAddressesType)
  async getAllAddresses(
    @CurrentUser()
    user: JwtPayload,
    @Args('page', { type: () => Int, nullable: true })
    page?: number,
    @Args('limit', { type: () => Int, nullable: true })
    limit?: number,
    @Args('name', { type: () => String, nullable: true })
    name?: string,
    @Args('addressType', { type: () => AddressTypeEnum, nullable: true })
    addressType?: AddressTypeEnum,
  ): Promise<PaginatedAddressesType> {
    return this.queryBus.execute(
      new GetAllAddressesDTO(user.tenantId, user.customerId, {
        page,
        limit,
        name,
        addressType,
      }),
    );
  }

  @Query(() => [CountryType])
  async getAllCountries(): Promise<CountryType[]> {
    return this.queryBus.execute(new GetAllCountriesDTO());
  }

  @Query(() => [StateType])
  async getStatesByCountryId(
    @Args('countryId', { type: () => ID }) countryId: string,
  ): Promise<StateType[]> {
    return this.queryBus.execute(new GetStatesByCountryIdDTO(countryId));
  }
}
