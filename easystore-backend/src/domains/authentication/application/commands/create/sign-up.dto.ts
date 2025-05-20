import { IAuthIdentityBaseType } from '../../../aggregates/entities';

export class AuthenticationRegisterDTO {
  readonly data: IAuthIdentityBaseType;

  constructor(data: IAuthIdentityBaseType) {
    this.data = data;
  }
}
