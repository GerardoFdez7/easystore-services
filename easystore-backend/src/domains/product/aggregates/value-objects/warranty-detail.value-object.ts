import { z } from 'zod';

const warrantyDetailSchema = z
  .object({
    duration: z
      .string()
      .min(1, { message: 'Duration must be a non-empty string' }),
    coverage: z
      .string()
      .min(1, { message: 'Coverage must be a non-empty string' }),
    instructions: z
      .string()
      .min(1, { message: 'Instructions must be a non-empty string' }),
  })
  .nullable();

export class WarrantyDetail {
  private readonly detail: {
    duration: string;
    coverage: string;
    instructions: string;
  };

  private constructor(detail: {
    duration: string;
    coverage: string;
    instructions: string;
  }) {
    this.detail = detail;
  }

  public static create(detail: {
    duration: string;
    coverage: string;
    instructions: string;
  }): WarrantyDetail {
    warrantyDetailSchema.parse(detail);
    return new WarrantyDetail(detail);
  }

  public getValue(): {
    duration: string;
    coverage: string;
    instructions: string;
  } {
    return this.detail;
  }

  public equals(otherDetail: WarrantyDetail): boolean {
    return JSON.stringify(this.detail) === JSON.stringify(otherDetail.detail);
  }
}
