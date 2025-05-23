import {
  IInstallmentPaymentBase,
  IInstallmentPaymentSystem,
} from '../../../aggregates/entities';

/**
 * Data Transfer Object for InstallmentPayment entity
 * Follows the same structure as IInstallmentPaymentType
 */
export interface InstallmentPaymentDTO
  extends IInstallmentPaymentBase,
    IInstallmentPaymentSystem {}
