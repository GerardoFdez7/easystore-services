import { SetMetadata } from '@nestjs/common';

export const IsAuthenticatedKey = 'isAuthenticated';

// Authenticated decorator for marking specific methods as authenticated
// in an otherwise public resolver
export const Authenticated = (): MethodDecorator =>
  SetMetadata(IsAuthenticatedKey, true);
