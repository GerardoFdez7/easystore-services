import {
  Warehouse,
  IWarehouseProps,
  IWarehouseType,
  IWarehouseBase,
} from '../../../aggregates/entities';
import {
  WarehouseName,
  AddressId,
  TenantId,
  CreatedAt,
  UpdatedAt,
} from '../../../aggregates/value-objects';
import { WarehouseDTO, PaginatedWarehousesDTO } from './warehouse.dto';
import { Id } from '@domains/value-objects';

/**
 * Centralized mapper for Warehouse domain entity to DTO conversion for queries and vice versa for commands.
 * Handles mapping between persistence layer models to domain entities.
 */
export class WarehouseMapper {
  /**
   * Maps a persistence Warehouse model to a domain Warehouse entity
   * @param persistenceWarehouse The Persistence Warehouse model
   * @returns The mapped Warehouse domain entity
   */
  static fromPersistence(persistenceWarehouse: IWarehouseType): Warehouse {
    const warehouseProps: IWarehouseProps = {
      id: Id.create(persistenceWarehouse.id),
      name: WarehouseName.create(persistenceWarehouse.name),
      addressId: AddressId.create(persistenceWarehouse.addressId),
      tenantId: TenantId.create(persistenceWarehouse.tenantId),
      createdAt: CreatedAt.create(persistenceWarehouse.createdAt),
      updatedAt: UpdatedAt.create(persistenceWarehouse.updatedAt),
    };
    return Warehouse.reconstitute(warehouseProps);
  }

  /**
   * Maps a Warehouse domain entity to a WarehouseDTO
   * @param warehouse The warehouse domain entity
   * @param fields Optional array of fields to include in the DTO
   * @returns The warehouse DTO
   */
  static toDto(
    data: Warehouse | PaginatedWarehousesDTO | WarehouseDTO,
    fields?: string[],
  ): WarehouseDTO | PaginatedWarehousesDTO {
    // If data is already a WarehouseDTO, return it directly
    if (!('warehouses' in data) && !('props' in data)) {
      return data;
    }

    // Handle pagination result
    if ('warehouses' in data && 'total' in data) {
      const paginatedData = data as PaginatedWarehousesDTO;
      return {
        warehouses: paginatedData.warehouses.map(
          (warehouse) => this.toDto(warehouse, fields) as WarehouseDTO,
        ),
        total: paginatedData.total,
        hasMore: paginatedData.hasMore,
      } as PaginatedWarehousesDTO;
    }

    // Handle single warehouse
    const warehouse = data as Warehouse;

    // If no fields specified, return all fields
    if (!fields || fields.length === 0) {
      return warehouse.toDTO<WarehouseDTO>((entity) => ({
        id: entity.get('id')?.getValue(),
        name: entity.get('name')?.getValue(),
        addressId: entity.get('addressId')?.getValue(),
        tenantId: entity.get('tenantId')?.getValue(),
        createdAt: entity.get('createdAt')?.getValue(),
        updatedAt: entity.get('updatedAt')?.getValue(),
      }));
    }

    // Return only requested fields
    const dto: Partial<WarehouseDTO> = {};

    // Always include ID
    dto.id = warehouse.get('id')?.getValue();

    // Map only requested fields
    fields.forEach((field) => {
      switch (field) {
        case 'name':
          dto.name = warehouse.get('name')?.getValue();
          break;
        case 'addressId':
          dto.addressId = warehouse.get('addressId')?.getValue();
          break;
        case 'tenantId':
          dto.tenantId = warehouse.get('tenantId')?.getValue();
          break;
        case 'createdAt':
          dto.createdAt = warehouse.get('createdAt')?.getValue();
          break;
        case 'updatedAt':
          dto.updatedAt = warehouse.get('updatedAt')?.getValue();
          break;
      }
    });

    return dto as WarehouseDTO;
  }

  /**
   * Maps an array of Warehouse domain entities to an array of WarehouseDTOs
   * @param warehouses The array of warehouse domain entities
   * @param fields Optional array of fields to include in the DTOs
   * @returns Array of warehouse DTOs
   */
  static toDtoArray(warehouses: Warehouse[], fields?: string[]): WarehouseDTO[] {
    return warehouses.map((warehouse) => this.toDto(warehouse, fields) as WarehouseDTO);
  }

  /**
   * Maps a create DTO to a Warehouse domain entity
   * @param dto The create DTO
   * @returns The warehouse domain entity
   */
  static fromCreateDto(dto: IWarehouseBase): Warehouse {
    return Warehouse.create(dto);
  }

  /**
   * Maps an update DTO to update an existing Warehouse domain entity
   * @param existingWarehouse The existing warehouse domain entity
   * @param dto The update DTO
   * @returns The updated warehouse domain entity
   */
  static fromUpdateDto(
    existingWarehouse: Warehouse,
    dto: Partial<IWarehouseBase>,
  ): Warehouse {
    return Warehouse.update(existingWarehouse, dto);
  }
} 