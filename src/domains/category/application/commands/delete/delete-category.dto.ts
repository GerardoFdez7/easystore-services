export class DeleteCategoryDTO {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
  ) {}
}
