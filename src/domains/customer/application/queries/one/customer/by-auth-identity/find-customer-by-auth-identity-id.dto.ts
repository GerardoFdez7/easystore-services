export interface CustomerIdentityDTO {
  id: string;
  tenantId: string;
}

export class FindCustomerByAuthIdentityIdDto {
  constructor(public readonly authIdentityId: string) {}
}
