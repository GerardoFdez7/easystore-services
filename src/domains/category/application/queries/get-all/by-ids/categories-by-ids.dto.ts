export class GetCategoriesByIdsDTO {
  constructor(
    public readonly categoriesIds: string[],
    public readonly storeId: string,
  ) {}
}
