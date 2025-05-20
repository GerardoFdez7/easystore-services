import { AuthIdentity } from '../entities/authentication.entity';

export class AuthenticationRegisterEvent {
  constructor(public readonly auth: AuthIdentity) {}
}
