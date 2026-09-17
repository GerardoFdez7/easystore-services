export class GetWarehouseByIdDTO {
  constructor(
    public readonly id: string,
    public readonly storeId: string,
    public readonly isArchived?: boolean,
  ) {}
}
