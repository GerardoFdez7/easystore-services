import { AccountTypeEnum } from '../../../aggregates/value-objects';

export class AuthenticationLoginDTO {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly accountType: AccountTypeEnum,
  ) {}
}
