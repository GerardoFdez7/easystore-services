import { AuthIdentity } from '../../entities';

export class AuthenticationUpdatePasswordEvent {
  constructor(public readonly auth: AuthIdentity) {}
}
