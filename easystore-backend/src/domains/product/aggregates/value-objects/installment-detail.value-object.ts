import { z } from 'zod';

const installmentDetailSchema = z.object({
  months: z
    .number()
    .int()
    .positive({ message: 'Months must be a positive integer' }),
  interestRate: z
    .number()
    .nonnegative({ message: 'Interest rate must be a non-negative number' }),
});

export type InstallmentDetailProps = {
  months: number;
  interestRate: number;
};

export class InstallmentDetail {
  private readonly value: InstallmentDetailProps;

  private constructor(value: InstallmentDetailProps) {
    this.value = value;
  }

  public static create(value: InstallmentDetailProps): InstallmentDetail {
    installmentDetailSchema.parse(value);
    return new InstallmentDetail(value);
  }

  public getValue(): InstallmentDetailProps {
    return this.value;
  }

  public equals(otherDetail: InstallmentDetail): boolean {
    return JSON.stringify(this.value) === JSON.stringify(otherDetail.value);
  }
}
