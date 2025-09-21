import { Entity } from '@shared/entity.base';
import {
  Tenant,
  ITenantProps,
  ITenantType,
} from '../../../aggregates/entities';
import {
  Id,
  Name,
  LongDescription,
  Domain,
  Media,
  Currency,
} from '../../../aggregates/value-objects';
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
    return Entity.fromPersistence<
      typeof persistenceTenant,
      ITenantProps,
      Tenant
    >(Tenant, persistenceTenant, (model) => ({
      id: Id.create(model.id),
      businessName: model.businessName ? Name.create(model.businessName) : null,
      ownerName: Name.create(model.ownerName),
      domain: model.domain ? Domain.create(model.domain) : null,
      logo: Media.create(model.logo),
      description: model.description
        ? LongDescription.create(model.description)
        : null,
      currency: Currency.create(model.currency),
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
      id: entity.get('id')?.getValue() || undefined,
      ownerName: entity.get('ownerName').getValue(),
      businessName: entity.get('businessName')?.getValue(),
      email: '', // Email will be provided by the resolver from JWT payload
      domain: entity.get('domain')?.getValue(),
      logo: entity.get('logo')?.getValue(),
      description: entity.get('description')?.getValue(),
      currency: entity.get('currency').getValue(),
      authIdentityId: entity.get('authIdentityId').getValue(),
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
    return Tenant.create(dto.data as ITenantType);
  }

  /**
   * Maps an update DTO to update an existing Tenant domain entity
   * @param tenant The existing tenant domain entity
   * @param dto The update DTO containing the fields to update
   * @returns The updated Tenant domain entity
   */
  static fromUpdateDto(
    tenant: Tenant,
    dto: { data: Partial<ITenantType> },
  ): Tenant {
    tenant.update(dto.data);
    return tenant;
  }
}
