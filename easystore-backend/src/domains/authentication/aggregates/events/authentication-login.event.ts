import { AuthIdentity } from '../entities/authentication.entity';

export class AuthenticationLoginEvent {
  constructor(public readonly auth: AuthIdentity) {}
}
