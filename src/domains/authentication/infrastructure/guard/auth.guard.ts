import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { verifyToken, JwtPayload } from '../jwt/jwt-handler';
import { IsPublicKey } from '../decorators/public.decorator';

interface RequestWithUser {
  headers: {
    authorization?: string;
  };
  user?: JwtPayload;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IsPublicKey, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Get the GraphQL context
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext<{ req: RequestWithUser }>();

    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Authorization token is required');
    }

    // Determine authentication scheme and delegate to appropriate handler
    if (authHeader.startsWith('Bearer ')) {
      return this.handleBearerToken(authHeader, req);
    }

    // Future: Add OAuth handling here
    // if (authHeader.startsWith('OAuth ')) {
    //   return this.handleOAuthToken(authHeader, req);
    // }

    throw new UnauthorizedException('Unsupported authentication scheme');
  }

  private handleBearerToken(authHeader: string, req: RequestWithUser): boolean {
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

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
