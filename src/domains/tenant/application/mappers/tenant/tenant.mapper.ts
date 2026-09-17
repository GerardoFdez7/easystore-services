import { Tenant, ITenantBase, ITenantType } from '../../../aggregates/entities';
import { Id, Name } from '../../../aggregates/value-objects';
import { TenantDTO } from '..';
import { TenantSingUpDTO } from '../../commands';

/**
 * Centralized mapper for Tenant domain entity to DTO conversion for queries and vice versa for commands.
 * Handles mapping between persistence layer models to domain entities.
 */
export class TenantMapper {
  /**
   * Maps a persistence Tenant model to a domain Tenant entity
   * @param persistenceTenant The Persistence Tenant model
   * @returns The mapped Tenant domain entity
   */
  static fromPersistence(persistenceTenant: ITenantType): Tenant {
    return Tenant.reconstitute({
      id: Id.create(persistenceTenant.id),
      name: Name.create(persistenceTenant.name),
      authIdentityId: Id.create(persistenceTenant.authIdentityId),
      defaultStoreId: persistenceTenant.defaultStoreId
        ? Id.create(persistenceTenant.defaultStoreId)
        : null,
      defaultPhoneNumberId: persistenceTenant.defaultPhoneNumberId
        ? Id.create(persistenceTenant.defaultPhoneNumberId)
        : null,
      defaultShippingAddressId: persistenceTenant.defaultShippingAddressId
        ? Id.create(persistenceTenant.defaultShippingAddressId)
        : null,
      defaultBillingAddressId: persistenceTenant.defaultBillingAddressId
        ? Id.create(persistenceTenant.defaultBillingAddressId)
        : null,
      createdAt: persistenceTenant.createdAt,
      updatedAt: persistenceTenant.updatedAt,
    });
  }

  /**
   * Maps a Tenant domain entity to a TenantDTO
   * @param tenant The tenant domain entity
   * @returns The tenant DTO
   */
  static toDto(tenant: Tenant): TenantDTO {
    return tenant.toDTO<TenantDTO>((entity) => ({
      id: entity.get('id')?.getValue() || undefined,
      name: entity.get('name').getValue(),
      email: '',
      authIdentityId: entity.get('authIdentityId').getValue(),
      defaultStoreId: entity.get('defaultStoreId')?.getValue(),
      defaultPhoneNumberId: entity.get('defaultPhoneNumberId')?.getValue(),
      defaultShippingAddressId: entity
        .get('defaultShippingAddressId')
        ?.getValue(),
      defaultBillingAddressId: entity
        .get('defaultBillingAddressId')
        ?.getValue(),
      createdAt: entity.get('createdAt'),
      updatedAt: entity.get('updatedAt'),
    }));
  }

  /**
   * Maps a TenantDTO to a domain entity
   * @param dto The tenant DTO
   * @returns The mapped Tenant domain entity`
   */
  static fromCreateDto(dto: TenantSingUpDTO): Tenant {
    // Create a new tenant using the factory method
    return Tenant.create(dto.data);
  }

  /**
   * Maps an update DTO to update an existing Tenant domain entity
   * @param tenant The existing tenant domain entity
   * @param dto The update DTO containing the fields to update
   * @returns The updated Tenant domain entity
   */
  static fromUpdateDto(
    tenant: Tenant,
    dto: {
      data: Partial<Omit<ITenantBase, 'authIdentityId' | 'defaultStoreId'>>;
    },
  ): Tenant {
    tenant.update(dto.data);
    return tenant;
  }
}
