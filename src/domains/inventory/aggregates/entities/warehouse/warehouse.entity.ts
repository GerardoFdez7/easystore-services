import { BadRequestException } from '@nestjs/common';
import {
  WarehouseName,
  AddressId,
  TenantId,
  CreatedAt,
  UpdatedAt,
} from '../../value-objects/warehouse';
import { Id } from '@domains/value-objects';
import { Entity, EntityProps } from '@domains/entity.base';
import {
  WarehouseCreatedEvent,
  WarehouseUpdatedEvent,
} from '../../events';
import { IWarehouseBase } from './warehouse.attributes';

export interface IWarehouseProps extends EntityProps {
  id: Id;
  name: WarehouseName;
  addressId: AddressId;
  tenantId: TenantId;
  createdAt: CreatedAt;
  updatedAt: UpdatedAt;
}

export class Warehouse extends Entity<IWarehouseProps> {
  private constructor(props: IWarehouseProps) {
    super(props);
  }

  /**
   * Factory method to reconstitute a Warehouse from persistence or other sources.
   * Assumes all props are already in domain format.
   * @param props The complete properties of the warehouse.
   * @returns The reconstituted Warehouse domain entity.
   */
  static reconstitute(props: IWarehouseProps): Warehouse {
    return new Warehouse(props);
  }

  /**
   * Factory method to create a new Warehouse
   * @param props The base properties for creating a warehouse
   * @returns The created Warehouse domain entity
   */
  static create(props: IWarehouseBase): Warehouse {
    const transformedProps = {
      id: Id.generate(),
      name: WarehouseName.create(props.name),
      addressId: AddressId.create(props.addressId),
      tenantId: TenantId.create(props.tenantId),
      createdAt: CreatedAt.createNow(),
      updatedAt: UpdatedAt.createNow(),
    };

    const warehouse = new Warehouse(transformedProps);

    // Apply domain event
    warehouse.apply(new WarehouseCreatedEvent(warehouse));

    return warehouse;
  }

  /**
   * Updates an existing Warehouse with new values
   * @param warehouse The existing Warehouse to update
   * @param updates The properties to update
   * @returns The updated Warehouse domain entity
   */
  static update(
    warehouse: Warehouse,
    updates: Partial<Omit<IWarehouseBase, 'tenantId'>>,
  ): Warehouse {
    const props = { ...warehouse.props };

    if (updates.name !== undefined) {
      props.name = WarehouseName.create(updates.name);
    }

    if (updates.addressId !== undefined) {
      props.addressId = AddressId.create(updates.addressId);
    }

    props.updatedAt = UpdatedAt.createNow();

    const updatedWarehouse = new Warehouse(props);

    // Apply domain event
    updatedWarehouse.apply(new WarehouseUpdatedEvent(updatedWarehouse));

    return updatedWarehouse;
  }

  // Getters
  public getId(): Id {
    return this.props.id;
  }

  public getName(): WarehouseName {
    return this.props.name;
  }

  public getAddressId(): AddressId {
    return this.props.addressId;
  }

  public getTenantId(): TenantId {
    return this.props.tenantId;
  }

  public getCreatedAt(): CreatedAt {
    return this.props.createdAt;
  }

  public getUpdatedAt(): UpdatedAt {
    return this.props.updatedAt;
  }

  // Business logic methods
  public changeName(newName: string): Warehouse {
    return Warehouse.update(this, { name: newName });
  }

  public changeAddress(newAddressId: string): Warehouse {
    return Warehouse.update(this, { addressId: newAddressId });
  }

  public isFromTenant(tenantId: string): boolean {
    return this.props.tenantId.getValue() === tenantId;
  }

  public getAgeInDays(): number {
    const now = new Date();
    const createdAt = this.props.createdAt.getValue();
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
} 