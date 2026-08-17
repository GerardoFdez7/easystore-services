import { IEvent } from '@nestjs/cqrs';
import { AuthIdentity } from '../../entities';

export class AuthenticationLogoutEvent implements IEvent {
  constructor(public readonly auth: AuthIdentity) {}
}
