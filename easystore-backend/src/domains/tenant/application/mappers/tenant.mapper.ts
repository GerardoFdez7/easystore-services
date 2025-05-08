import { Tenant } from '../../aggregates/entities/tenant.entity';
import { TenantDTO } from './tenant.dto';

/**
 * Centralized mapper for Tenant domain entity to DTO conversion
 */
export class TenantMapper {
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
}
