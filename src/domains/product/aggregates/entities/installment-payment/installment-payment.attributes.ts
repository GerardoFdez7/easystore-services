export interface IInstallmentPaymentBase {
  months: number;
  interestRate: number;
  variantId: string;
}

export interface IInstallmentPaymentSystem {
  id: string;
}

export interface IInstallmentPaymentType
  extends IInstallmentPaymentBase,
    IInstallmentPaymentSystem {}
