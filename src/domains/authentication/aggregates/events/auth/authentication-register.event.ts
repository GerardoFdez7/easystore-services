import { AuthIdentity } from '../../entities';

export class AuthenticationRegisterEvent {
  constructor(
    public readonly auth: AuthIdentity,
    public readonly domain?: string,
  ) {}
}
