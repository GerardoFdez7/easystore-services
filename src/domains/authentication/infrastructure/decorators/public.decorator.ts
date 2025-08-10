import { SetMetadata } from '@nestjs/common';

export const IsPublicKey = 'isPublic';

// Public decorator that works for both classes and methods
export const Public = (): ClassDecorator & MethodDecorator =>
  SetMetadata(IsPublicKey, true);
