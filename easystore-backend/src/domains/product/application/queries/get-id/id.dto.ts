export class GetProductByIdDTO {
  constructor(
    public readonly id: number,
    public readonly tenantId: number,
  ) {}
}
