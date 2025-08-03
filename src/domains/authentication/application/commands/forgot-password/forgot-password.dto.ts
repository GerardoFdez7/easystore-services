import { AccountTypeEnum } from '../../../aggregates/value-objects';

export interface IForgotPasswordData {
  email: string;
  accountType: AccountTypeEnum;
}

export class ForgotPasswordDTO {
  constructor(public readonly data: IForgotPasswordData) {}
}
