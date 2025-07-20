import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtPayload } from '../jwt/jwt-handler';

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
