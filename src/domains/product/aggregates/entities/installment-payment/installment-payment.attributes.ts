export interface IInstallmentPaymentBase {
  months: number;
  interestRate: number;
  variantId: number;
}

export interface IInstallmentPaymentSystem {
  id: number;
}

export interface IInstallmentPaymentType
  extends IInstallmentPaymentBase,
    IInstallmentPaymentSystem {}
