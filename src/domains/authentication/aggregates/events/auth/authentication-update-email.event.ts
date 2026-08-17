import { IEvent } from '@nestjs/cqrs';
import { AuthIdentity } from '../../entities';

export class AuthenticationUpdateEmailEvent implements IEvent {
  constructor(public readonly auth: AuthIdentity) {}
}
