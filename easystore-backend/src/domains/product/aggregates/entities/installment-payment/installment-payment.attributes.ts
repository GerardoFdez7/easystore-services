export interface IInstallmentPaymentBase {
  months: number;
  interestRate: number;
  variantId: number;
}

export interface IInstallmentPaymentSystem {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInstallmentPaymentType
  extends IInstallmentPaymentBase,
    IInstallmentPaymentSystem {}
