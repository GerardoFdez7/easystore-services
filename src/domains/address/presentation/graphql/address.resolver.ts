import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AddressType, CreateAddressInput } from './types';
import { CreateAddressDto, AddressDeleteDTO } from '../../application/commands';

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
}
