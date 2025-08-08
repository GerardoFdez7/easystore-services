import { ProviderEntity } from '../../../aggregates/entities/provider/provider.entity';
import { ProviderDto } from './provider.dto';

export class ProviderMapper {
  static toDto(entity: ProviderEntity): ProviderDto {
    return new ProviderDto(
      entity.id,
      entity.tenantId,
      entity.providerType,
      entity.credentials,
      entity.enabled,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
