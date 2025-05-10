import { Entity } from '@shared/domains/entity.base';
import { Tenant, TenantProps } from '../../aggregates/entities/tenant.entity';
import {
  BusinessName,
  Email,
  Id,
  OwnerName,
  Password,
} from '../../aggregates/value-objects';
import { TenantDTO } from './tenant.dto';
import { TenantSingUpDTO } from '../commands/create/sing-up.dto';

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
  static fromPersistence(persistenceTenant: {
    id: number;
    businessName: string;
    ownerName: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
  }): Tenant {
    return Entity.fromPersistence<
      typeof persistenceTenant,
      TenantProps,
      Tenant
    >(Tenant, persistenceTenant, (model) => ({
      id: Id.create(model.id),
      businessName: BusinessName.create(model.businessName),
      ownerName: OwnerName.create(model.ownerName),
      email: Email.create(model.email),
      password: Password.createHashed(model.password),
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
      id: entity.get('id').getValue(),
      email: entity.get('email').getValue(),
      businessName: entity.get('businessName').getValue(),
      ownerName: entity.get('ownerName').getValue(),
    }));
  }

  /**
   * Maps a TenantDTO to a domain entity
   * @param dto The tenant DTO
   * @returns The mapped Tenant domain entity
   */
  static fromCreateDto(dto: TenantSingUpDTO): Tenant {
    // Create a new tenant using the factory method
    return Tenant.create(
      dto.businessName,
      dto.ownerName,
      dto.email,
      dto.password,
    );
  }
}
