import { AuthIdentity } from '../../entities';

export class AuthenticationUpdateEmailEvent {
  constructor(public readonly auth: AuthIdentity) {}
}
