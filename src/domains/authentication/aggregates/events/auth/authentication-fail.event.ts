import { IEvent } from '@nestjs/cqrs';
import { AuthIdentity } from '../../entities';

export class AuthenticationFailedEvent implements IEvent {
  constructor(public readonly auth: AuthIdentity) {}
}
