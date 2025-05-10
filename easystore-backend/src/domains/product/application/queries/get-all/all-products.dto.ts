export class GetAllProductsDTO {
  page: number;
  limit: number;
  categoryId?: string;
  includeSoftDeleted?: boolean;
}
