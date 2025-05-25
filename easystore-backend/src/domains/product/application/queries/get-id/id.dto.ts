export class GetProductByIdDTO {
  constructor(
    public readonly tenantId: number,
    public readonly id: number,
  ) {}
}
