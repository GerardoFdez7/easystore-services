import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtPayload } from '../../domains/authentication/infrastructure/jwt/jwt-handler';

// Re-export JwtPayload for convenience
export { JwtPayload };

interface RequestWithUser {
  user: JwtPayload;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): JwtPayload => {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext<{ req: RequestWithUser }>();
    return req.user;
  },
);
