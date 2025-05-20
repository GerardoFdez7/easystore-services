import { AuthIdentity } from '../entities/auth/authentication.entity';

export class AuthenticationRegisterEvent {
  constructor(public readonly auth: AuthIdentity) {}
}
