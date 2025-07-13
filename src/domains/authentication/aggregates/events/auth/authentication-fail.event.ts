import { AuthIdentity } from '../../entities';

export class AuthenticationFailedEvent {
  constructor(public readonly auth: AuthIdentity) {}
}
