import { Store, IStoreType } from '../../../aggregates/entities';
import {
  Currency,
  Domain,
  Id,
  LongDescription,
  Media,
  Name,
} from '../../../aggregates/value-objects';
import { CreateStoreDTO } from '../../commands/create/create-store.dto';
import { UpdateStoreDTO } from '../../commands/update/update-store.dto';
import { StoreDTO } from './store.dto';

/** Translates Store data at the application and persistence boundaries. */
export class StoreMapper {
  static fromPersistence(store: IStoreType): Store {
    return Store.reconstitute({
      id: Id.create(store.id),
      tenantId: Id.create(store.tenantId),
      name: store.name ? Name.create(store.name) : null,
      domain: store.domain ? Domain.create(store.domain) : null,
      logo: store.logo ? Media.create(store.logo) : null,
      description: store.description
        ? LongDescription.create(store.description)
        : null,
      currency: Currency.create(store.currency),
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
    });
  }

  static toDto(store: Store): StoreDTO {
    return store.toDTO<StoreDTO>((entity) => ({
      id: entity.get('id').getValue(),
      tenantId: entity.get('tenantId').getValue(),
      name: entity.get('name')?.getValue() ?? undefined,
      domain: entity.get('domain')?.getValue() ?? undefined,
      logo: entity.get('logo')?.getValue() ?? undefined,
      description: entity.get('description')?.getValue() ?? undefined,
      currency: entity.get('currency').getValue(),
      createdAt: entity.get('createdAt'),
      updatedAt: entity.get('updatedAt'),
    }));
  }

  static fromCreateDto(dto: CreateStoreDTO): Store {
    return Store.create(dto.data);
  }

  static fromUpdateDto(store: Store, dto: UpdateStoreDTO): Store {
    return store.update(dto.data);
  }
}
