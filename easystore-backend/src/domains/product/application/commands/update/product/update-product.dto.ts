import { IProductBase } from '../../../../aggregates/entities';

/**
 * Data Transfer Object for updating a Product
 * Makes all fields from IProductBaseType optional except id
 */
export class UpdateProductDTO {
  id: number;
  name?: string | null;
  shortDescription?: string;
  longDescription?: string | null;
  type?: 'PHYSICAL' | 'DIGITAL';
  cover?: string | null;
  tags?: string[] | null;
  brand?: string | null;
  manufacturer?: string | null;

  constructor(data: { id: string } & Partial<IProductBase>) {
    Object.assign(this, data);
  }
}
