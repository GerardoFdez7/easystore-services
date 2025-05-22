import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterAuthInput, AuthIdentityType } from './authentication.types';
import { AuthenticationRegisterDTO } from '../../application/commands/create/sign-up.dto';

@Resolver(() => AuthIdentityType)
export class AuthenticationResolver {
  constructor(private readonly commandBus: CommandBus) {}

  ///////////////
  // Mutations //
  ///////////////

  @Mutation(() => AuthIdentityType)
  async register(
    @Args('input') input: RegisterAuthInput,
  ): Promise<AuthIdentityType> {
    return await this.commandBus.execute(new AuthenticationRegisterDTO(input));
  }
}
