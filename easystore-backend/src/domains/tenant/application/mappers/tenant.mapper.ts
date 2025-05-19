import { Entity } from '@domains/entity.base';
import { Id, Name, LongDescription } from '@domains/value-objects';
import { Tenant, ITenantProps, ITenantType } from '../../aggregates/entities';
import { Domain, Logo } from '../../aggregates/value-objects';
import { TenantDTO } from './';
import { TenantSingUpDTO } from '../commands';

/**
 * Centralized mapper for Product domain entity to DTO conversion for queries and vice versa for commands.
 * Handles mapping between persistence layer models to domain entities.
 */
export class TenantMapper {
  /**
   * Maps a persistence Product model to a domain Product entity
   * @param persistenceTenant The Persistence Product model
   * @returns The mapped Product domain entity
   */
  static fromPersistence(persistenceTenant: ITenantType): Tenant {
    return Entity.fromPersistence<
      typeof persistenceTenant,
      ITenantProps,
      Tenant
    >(Tenant, persistenceTenant, (model) => ({
      id: Id.create(model.id),
      businessName: Name.create(model.businessName),
      ownerName: Name.create(model.ownerName),
      domain: model.domain
        ? Domain.create(model.domain)
        : Domain.createDefault(model.businessName),
      logo: model.logo ? Logo.create(model.logo) : null,
      description: model.description
        ? LongDescription.create(model.description)
        : null,
      authIdentityId: Id.create(model.authIdentityId),
      defaultPhoneNumberId: model.defaultPhoneNumberId
        ? Id.create(model.defaultPhoneNumberId)
        : null,
      defaultShippingAddressId: model.defaultShippingAddressId
        ? Id.create(model.defaultShippingAddressId)
        : null,
      defaultBillingAddressId: model.defaultBillingAddressId
        ? Id.create(model.defaultBillingAddressId)
        : null,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    }));
  }

  /**
   * Maps a Tenant domain entity to a TenantDTO
   * @param tenant The tenant domain entity
   * @returns The tenant DTO
   */
  static toDto(tenant: Tenant): TenantDTO {
    return tenant.toDTO<TenantDTO>((entity) => ({
      id: entity.get('id')?.getValue() || null,
      ownerName: entity.get('ownerName').getValue(),
      businessName: entity.get('businessName').getValue(),
      domain: entity.get('domain').getValue(),
      logo: entity.get('logo')?.getValue() || null,
      description: entity.get('description')?.getValue() || null,
      authIdentityId: entity.get('authIdentityId').getValue(),
      defaultPhoneNumberId:
        entity.get('defaultPhoneNumberId')?.getValue() || null,
      defaultShippingAddressId:
        entity.get('defaultShippingAddressId')?.getValue() || null,
      defaultBillingAddressId:
        entity.get('defaultBillingAddressId')?.getValue() || null,
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
    return Tenant.create(dto.data as ITenantType);
  }
}
