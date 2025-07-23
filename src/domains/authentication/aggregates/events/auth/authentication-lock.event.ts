import { AuthIdentity } from '../../entities';

export class AuthenticationLockedEvent {
  constructor(public readonly auth: AuthIdentity) {}
}
