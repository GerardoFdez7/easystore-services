export class GetAllProductsDTO {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly categoryId?: string,
    public readonly includeSoftDeleted?: boolean,
  ) {}
}
