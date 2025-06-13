import { AuthIdentity } from '../entities';

export class AuthenticationRegisterEvent {
  constructor(public readonly auth: AuthIdentity) {}
}
