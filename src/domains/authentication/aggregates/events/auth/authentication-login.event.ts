import { AuthIdentity } from '../../entities';

export class AuthenticationLoginEvent {
  constructor(public readonly auth: AuthIdentity) {}
}
