import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Decorator to extract the current user from the request in a GraphQL context.
 *
 * e.g.:
 * @Query(() => UserType)
 * getProfile(@CurrentUser() user: UserEntity) {
 *   return this.userService.findById(user.id);
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request: { user?: unknown } = ctx.getContext<{
      req: { user?: unknown };
    }>().req;

    // The user object is set by the authentication middleware (e.g., Passport.js)
    return request.user;
  },
);
