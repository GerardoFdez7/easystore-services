export interface CustomerIdentityDTO {
  id: string;
  storeId: string;
}

export class FindCustomerByAuthIdentityIdDto {
  constructor(public readonly authIdentityId: string) {}
}
