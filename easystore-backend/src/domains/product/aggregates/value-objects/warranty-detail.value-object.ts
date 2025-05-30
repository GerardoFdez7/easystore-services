import { z } from 'zod';

const warrantyDetailSchema = z
  .object({
    months: z.number(),
    coverage: z
      .string()
      .min(1, { message: 'Coverage must be a non-empty string' }),
    instructions: z
      .string()
      .min(1, { message: 'Instructions must be a non-empty string' }),
  })
  .optional();

export type WarrantyDetailProps = {
  months: number;
  coverage: string;
  instructions: string;
};

export class WarrantyDetail {
  private readonly value: WarrantyDetailProps;

  private constructor(value: WarrantyDetailProps) {
    this.value = value;
  }

  public static create(value: WarrantyDetailProps): WarrantyDetail {
    warrantyDetailSchema.parse(value);
    return new WarrantyDetail(value);
  }

  public getValue(): WarrantyDetailProps {
    return this.value;
  }

  public equals(otherDetail: WarrantyDetail): boolean {
    return JSON.stringify(this.value) === JSON.stringify(otherDetail.value);
  }
}
