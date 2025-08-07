export class GetWarehouseByIdDTO {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
  ) {}
}
