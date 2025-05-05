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

export class InstallmentDetail {
  private readonly months: number;
  private readonly interestRate: number;

  private constructor(months: number, interestRate: number) {
    this.months = months;
    this.interestRate = interestRate;
  }

  public static create(detail: {
    months: number;
    interestRate: number;
  }): InstallmentDetail {
    installmentDetailSchema.parse(detail);
    return new InstallmentDetail(detail.months, detail.interestRate);
  }

  public getDetail(): { months: number; interestRate: number } {
    return {
      months: this.months,
      interestRate: this.interestRate,
    };
  }

  public equals(otherDetail: InstallmentDetail): boolean {
    return (
      this.months === otherDetail.months &&
      this.interestRate === otherDetail.interestRate
    );
  }
}
