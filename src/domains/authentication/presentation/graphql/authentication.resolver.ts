import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CommandBus } from '@nestjs/cqrs';
import {
  AuthIdentityType,
  RegisterAuthInput,
  LoginAuthInput,
  LoginResponseType,
} from './types/authentication.types';
import {
  AuthenticationRegisterDTO,
  AuthenticationLoginDTO,
} from '../../application/commands';

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

  @Mutation(() => LoginResponseType)
  async login(
    @Args('input') input: LoginAuthInput,
  ): Promise<LoginResponseType> {
    return await this.commandBus.execute(new AuthenticationLoginDTO(input));
  }
}
