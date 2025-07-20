import { AuthIdentity } from '../../entities';

export class AuthenticationLogoutEvent {
  constructor(public readonly auth: AuthIdentity) {}
}
