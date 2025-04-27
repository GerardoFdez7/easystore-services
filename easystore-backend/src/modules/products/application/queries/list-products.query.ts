export class ListProductsQuery {
  constructor(
    public readonly clientId: number,
    public readonly categoryId?: string,
    public readonly skip?: number,
    public readonly take?: number,
  ) {}
}
