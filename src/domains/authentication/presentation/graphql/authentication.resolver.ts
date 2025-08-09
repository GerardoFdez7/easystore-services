import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Request, Response } from 'express';
import { Public } from '../../infrastructure/decorators/public.decorator';
import {
  setTokenCookies,
  clearTokenCookies,
  extractTokenFromCookies,
} from '../../infrastructure/jwt';
import {
  AuthIdentityType,
  AuthenticationInput,
  ResponseType,
  ForgotPasswordInput,
  UpdatePasswordInput,
} from './types';
import {
  AuthenticationRegisterDTO,
  AuthenticationLoginDTO,
  AuthenticationLogoutDTO,
  ForgotPasswordDTO,
  UpdatePasswordDTO,
} from '../../application/commands';
import { AuthenticationValidateTokenDTO } from '../../application/queries';
import { ResponseDTO } from '../../application/mappers';

@Resolver(() => AuthIdentityType)
export default class AuthenticationResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  ///////////////
  // Mutations //
  ///////////////

  @Public()
  @Mutation(() => AuthIdentityType)
  async register(
    @Args('input') input: AuthenticationInput,
  ): Promise<AuthIdentityType> {
    return await this.commandBus.execute(new AuthenticationRegisterDTO(input));
  }

  @Public()
  @Mutation(() => ResponseType)
  async login(
    @Args('input') input: AuthenticationInput,
    @Context() context: { res: Response },
  ): Promise<ResponseType> {
    const result = await this.commandBus.execute<
      AuthenticationLoginDTO,
      ResponseDTO
    >(new AuthenticationLoginDTO(input));

    // Set tokens as httpOnly cookies
    if (result.accessToken && context.res) {
      setTokenCookies(context.res, result.accessToken);
    }

    return {
      success: result.success,
      message: result.message,
    };
  }

  @Public()
  @Mutation(() => ResponseType)
  async logout(
    @Context() context: { req: Request; res: Response },
  ): Promise<ResponseType> {
    // Extract token at resolver level
    const token = extractTokenFromCookies(context.req);

    if (!token) {
      return {
        success: false,
        message: 'No authentication token found in cookies',
      };
    }

    const result = await this.commandBus.execute<
      AuthenticationLogoutDTO,
      ResponseDTO
    >(new AuthenticationLogoutDTO(token));

    // Clear token cookies
    if (context.res) {
      clearTokenCookies(context.res);
    }

    return {
      success: result.success,
      message: result.message,
    };
  }

  @Public()
  @Mutation(() => ResponseType)
  async forgotPassword(
    @Args('input') input: ForgotPasswordInput,
  ): Promise<ResponseType> {
    const result = await this.commandBus.execute<
      ForgotPasswordDTO,
      ResponseDTO
    >(new ForgotPasswordDTO(input.email, input.accountType));

    return {
      success: result.success,
      message: result.message,
    };
  }

  @Public()
  @Mutation(() => ResponseType)
  async updatePassword(
    @Args('input') input: UpdatePasswordInput,
  ): Promise<ResponseType> {
    const result = await this.commandBus.execute<
      UpdatePasswordDTO,
      ResponseDTO
    >(new UpdatePasswordDTO(input.token, input.password));

    return {
      success: result.success,
      message: result.message,
    };
  }

  ///////////////
  //  Queries  //
  ///////////////

  @Public()
  @Query(() => ResponseType)
  async validateToken(
    @Context() context: { req: Request },
  ): Promise<ResponseType> {
    // Extract token at resolver level
    const token = extractTokenFromCookies(context.req);

    if (!token) {
      return {
        success: false,
        message: 'No authentication token found in cookies',
      };
    }

    const result = await this.queryBus.execute<
      AuthenticationValidateTokenDTO,
      ResponseDTO
    >(new AuthenticationValidateTokenDTO(token));

    return {
      success: result.success,
      message: result.message,
    };
  }
}
