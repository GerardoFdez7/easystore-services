import { IEvent } from '@nestjs/cqrs';
import { AuthIdentity } from '../../entities';

export class AuthenticationLoginEvent implements IEvent {
  constructor(public readonly auth: AuthIdentity) {}
}
