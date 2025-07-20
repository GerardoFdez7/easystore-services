import { IAuthIdentityBaseType } from '../../../aggregates/entities';

export class AuthenticationLoginDTO {
  constructor(public readonly data: IAuthIdentityBaseType) {}
}
