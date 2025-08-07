import { AccountTypeEnum } from '../../../aggregates/value-objects';

export interface IUpdatePasswordData {
  email: string;
  accountType: AccountTypeEnum;
  password: string;
}

export class UpdatePasswordDTO {
  constructor(public readonly data: IUpdatePasswordData) {}
}
