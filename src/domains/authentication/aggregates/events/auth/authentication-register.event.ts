import { IEvent } from '@nestjs/cqrs';
import { AuthIdentity } from '../../entities';

export class AuthenticationRegisterEvent implements IEvent {
  constructor(
    public readonly auth: AuthIdentity,
    public readonly domain?: string,
  ) {}
}