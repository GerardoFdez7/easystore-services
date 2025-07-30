import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { CommandBus } from '@nestjs/cqrs';
import { Public } from '../../infrastructure/decorators/public.decorator';
import { AuthIdentityType, AuthenticationInput, ResponseType } from './types';
import {
  AuthenticationRegisterDTO,
  AuthenticationLoginDTO,
  AuthenticationLogoutDTO,
  AuthenticationValidateTokenDTO,
} from '../../application/commands';
import { ResponseDTO } from '../../application/mappers';
import {
  setTokenCookies,
  clearTokenCookies,
  extractTokenFromCookies,
} from '../../infrastructure/jwt';
import { Request, Response } from 'express';

@Resolver(() => AuthIdentityType)
export class AuthenticationResolver {
  constructor(private readonly commandBus: CommandBus) {}

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

    const result = await this.commandBus.execute<
      AuthenticationValidateTokenDTO,
      ResponseDTO
    >(new AuthenticationValidateTokenDTO(token));

    return {
      success: result.success,
      message: result.message,
    };
  }
}
