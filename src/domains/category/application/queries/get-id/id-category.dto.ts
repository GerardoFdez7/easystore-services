export class GetCategoryByIdDTO {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
  ) {}
}
