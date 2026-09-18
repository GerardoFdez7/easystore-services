export class GetStoreByIdDTO {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
  ) {}
}
