import {
  Entity,
  InstallmentPayment,
  IInstallmentPaymentProps,
  IInstallmentPaymentType,
} from '../../../aggregates/entities';
import { Id, Months, InterestRate } from '../../../aggregates/value-objects';
import { InstallmentPaymentDTO } from '../';

/**
 * Centralized mapper for InstallmentPayment domain entity to DTO conversion for queries and vice versa for commands.
 * Handles mapping between persistence layer models to domain entities.
 */
export class InstallmentPaymentMapper {
  /**
   * Maps a persistence InstallmentPayment model to a InstallmentPaymentDTO.
   * @param persistenceInstallmentPayment The Persistence InstallmentPayment model to map.
   * @returns The mapped InstallmentPayment domain entity.
   */
  static fromPersistence(
    persistenceInstallmentPayment: IInstallmentPaymentType,
  ): InstallmentPayment {
    return Entity.fromPersistence<
      typeof persistenceInstallmentPayment,
      IInstallmentPaymentProps,
      InstallmentPayment
    >(InstallmentPayment, persistenceInstallmentPayment, (model) => ({
      id: Id.create(model.id),
      months: Months.create(model.months),
      interestRate: InterestRate.create(model.interestRate),
      variantId: Id.create(model.variantId),
    }));
  }

  /**
   * Maps a InstallmentPaymentDTO to a domain entity model.
   * @param dto The InstallmentPayment tDTO.
   * @returns The mapped InstallmentPayment domain entity.
   */
  static toDto(installmentPayment: InstallmentPayment): InstallmentPaymentDTO {
    return installmentPayment.toDTO<InstallmentPaymentDTO>((entity) => ({
      id: entity.get('id')?.getValue() || undefined,
      months: entity.get('months')?.getValue() || null,
      interestRate: entity.get('interestRate')?.getValue() || null,
      variantId: entity.get('variantId')?.getValue() || null,
    }));
  }
}
