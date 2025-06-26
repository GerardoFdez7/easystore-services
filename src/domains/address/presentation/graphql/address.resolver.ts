import { Resolver, Mutation, Args, ID, Query } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AddressType, CreateAddressInput } from './types';
import { CreateAddressDto, AddressDeleteDTO } from '../../application/commands';
import { GetAddressIdDto } from '../../application/queries';

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
    return this.commandBus.execute(new CreateAddressDto(input));
  }

  @Mutation(() => AddressType)
  async deleteAddress(
    @Args('id', { type: () => String }) id: string,
  ): Promise<AddressType> {
    return this.commandBus.execute(new AddressDeleteDTO(id));
  }

  ///////////////
  // Queries //
  ///////////////

  @Query(() => AddressType)
  async getAddressById(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<AddressType> {
    return this.queryBus.execute(new GetAddressIdDto(id));
  }
}
