import { AccountTypeEnum } from '../../../aggregates/value-objects';

export class ForgotPasswordDTO {
  constructor(
    public readonly email: string,
    public readonly accountType: AccountTypeEnum,
    public readonly locale: string,
  ) {}
}
