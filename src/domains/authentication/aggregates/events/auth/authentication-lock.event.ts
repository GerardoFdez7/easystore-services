import { IEvent } from '@nestjs/cqrs';
import { AuthIdentity } from '../../entities';

export class AuthenticationLockedEvent implements IEvent {
  constructor(public readonly auth: AuthIdentity) {}
}
