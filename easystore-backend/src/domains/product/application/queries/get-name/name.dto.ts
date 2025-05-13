export class GetProductsByNameDTO {
  constructor(
    public readonly name: string,
    public readonly includeSoftDeleted?: boolean,
  ) {}
}
