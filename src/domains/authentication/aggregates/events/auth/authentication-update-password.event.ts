import { IEvent } from '@nestjs/cqrs';
import { AuthIdentity } from '../../entities';

export class AuthenticationUpdatePasswordEvent implements IEvent {
  constructor(public readonly auth: AuthIdentity) {}
}
