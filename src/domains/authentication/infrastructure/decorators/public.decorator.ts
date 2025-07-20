import { SetMetadata } from '@nestjs/common';

export const IsPublicKey = 'isPublic';
export const Public = (): MethodDecorator => SetMetadata(IsPublicKey, true);
