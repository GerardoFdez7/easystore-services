import { IAuthIdentityBaseType } from '../../../aggregates/entities';

export class AuthenticationRegisterDTO {
  constructor(public readonly data: IAuthIdentityBaseType) {}
}
