import {
  InstallmentPayment,
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
    return InstallmentPayment.reconstitute({
      id: Id.create(persistenceInstallmentPayment.id),
      months: Months.create(persistenceInstallmentPayment.months),
      interestRate: InterestRate.create(
        persistenceInstallmentPayment.interestRate,
      ),
      variantId: Id.create(persistenceInstallmentPayment.variantId),
    });
  }

  /**
   * Maps a InstallmentPaymentDTO to a domain entity model.
   * @param dto The InstallmentPayment tDTO.
   * @returns The mapped InstallmentPayment domain entity.
   */
  static toDto(installmentPayment: InstallmentPayment): InstallmentPaymentDTO {
    return installmentPayment.toDTO<InstallmentPaymentDTO>((entity) => ({
      id: entity.get('id')?.getValue(),
      months: entity.get('months')?.getValue(),
      interestRate: entity.get('interestRate')?.getValue(),
      variantId: entity.get('variantId')?.getValue(),
    }));
  }
}
