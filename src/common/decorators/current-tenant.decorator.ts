import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtPayload } from '../../domains/authentication/infrastructure/jwt/jwt-handler';

interface RequestWithUser {
  user: JwtPayload;
}

export const CurrentTenant = createParamDecorator(
  (data: unknown, context: ExecutionContext): string => {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext<{ req: RequestWithUser }>();
    return req.user.tenantId;
  },
);
