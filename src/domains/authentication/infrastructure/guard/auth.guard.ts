import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import {
  verifyToken,
  JwtPayload,
  extractTokenFromCookies,
} from '../jwt/jwt-handler';
import { IsPublicKey, IsAuthenticatedKey } from '../decorators';

interface RequestWithUser extends Request {
  user?: JwtPayload;
}

@Injectable()
export default class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if the method is explicitly marked as authenticated
    const isAuthenticated = this.reflector.get<boolean>(
      IsAuthenticatedKey,
      context.getHandler(),
    );

    // If method is explicitly authenticated, require authentication
    if (isAuthenticated) {
      return this.requireAuthentication(context);
    }

    // Check if the route/class is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IsPublicKey, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Default behavior: require authentication
    return this.requireAuthentication(context);
  }

  private requireAuthentication(context: ExecutionContext): boolean {
    // Get the GraphQL context
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext<{ req: RequestWithUser }>();

    // Extract token from cookies
    const cookieToken = extractTokenFromCookies(req);
    if (!cookieToken) {
      throw new UnauthorizedException(
        'Authentication token is required in cookies',
      );
    }

    return this.handleToken(cookieToken, req);
  }

  private handleToken(token: string, req: RequestWithUser): boolean {
    try {
      // Verify the JWT token
      const payload = verifyToken(token);

      // Attach user info to the request context
      req.user = payload;

      return true;
    } catch (_error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // Future OAuth implementation
  // private handleOAuthToken(authHeader: string, req: RequestWithUser): boolean {
  //   // OAuth token validation logic
  //   return true;
  // }
}
