import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CommandBus } from '@nestjs/cqrs';
import { Public } from '../../infrastructure/decorators/public.decorator';
import {
  AuthIdentityType,
  RegisterAuthInput,
  LoginAuthInput,
  LoginResponseType,
  LogoutAuthInput,
  LogoutResponseType,
} from './types';
import {
  AuthenticationRegisterDTO,
  AuthenticationLoginDTO,
  AuthenticationLogoutDTO,
} from '../../application/commands';

@Resolver(() => AuthIdentityType)
export class AuthenticationResolver {
  constructor(private readonly commandBus: CommandBus) {}

  ///////////////
  // Mutations //
  ///////////////

  @Public()
  @Mutation(() => AuthIdentityType)
  async register(
    @Args('input') input: RegisterAuthInput,
  ): Promise<AuthIdentityType> {
    return await this.commandBus.execute(new AuthenticationRegisterDTO(input));
  }

  @Public()
  @Mutation(() => LoginResponseType)
  async login(
    @Args('input') input: LoginAuthInput,
  ): Promise<LoginResponseType> {
    return await this.commandBus.execute(new AuthenticationLoginDTO(input));
  }

  @Public()
  @Mutation(() => LogoutResponseType)
  async logout(
    @Args('input') input: LogoutAuthInput,
  ): Promise<LogoutResponseType> {
    return await this.commandBus.execute(
      new AuthenticationLogoutDTO(input.token),
    );
  }
}
