export class GetAllProductsDTO {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly includeSoftDeleted?: boolean,
  ) {}
}
