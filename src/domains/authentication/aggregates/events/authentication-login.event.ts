import { AuthIdentity } from '../entities/auth/authentication.entity';

export class AuthenticationLoginEvent {
  constructor(public readonly auth: AuthIdentity) {}
}
