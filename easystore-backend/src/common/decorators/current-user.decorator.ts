import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  // TODO: The user object is set by the authentication middleware (e.g., Passport.js)
  /**
   * Decorator to extract the current user from the request in a GraphQL context.
   *
   * e.g.:
   * @Query(() => UserType)
   * getProfile(@CurrentUser() user: UserEntity) {
   *   return this.userService.findById(user.id);
   * }
   */

  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request: { user?: unknown } = ctx.getContext<{
      req: { user?: unknown };
    }>().req;

    return request.user;
  },
);
