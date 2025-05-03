import { Entity, EntityProps } from '@shared/domains/entity.base';
import {
  BusinessName,
  Email,
  Id,
  OwnerName,
  Password,
} from '../value-objects/index';
import { TenantCreatedEvent } from '../events/tenant-created.event';

interface TenantProps extends EntityProps {
  id: Id;
  businessName: BusinessName;
  ownerName: OwnerName;
  email: Email;
  password: Password;
  createdAt: Date;
  updatedAt: Date;
}

export class Tenant extends Entity<TenantProps> {
  constructor(props: TenantProps) {
    super(props);
  }

  /**
   * Maps a Prisma Tenant model to a domain Tenant entity
   * @param prismaTenant The Prisma Tenant model
   * @returns The mapped Tenant domain entity
   */
  static fromPrisma(prismaTenant: {
    id: number;
    businessName: string;
    ownerName: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
  }): Tenant {
    return Entity.fromPersistence<typeof prismaTenant, TenantProps, Tenant>(
      Tenant,
      prismaTenant,
      (model) => ({
        id: Id.create(model.id),
        businessName: BusinessName.create(model.businessName),
        ownerName: OwnerName.create(model.ownerName),
        email: Email.create(model.email),
        password: Password.createHashed(model.password),
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
      }),
    );
  }

  // Factory method to create a new Tenant
  static create(
    businessNameStr: string,
    ownerNameStr: string,
    emailStr: string,
    passwordStr: string,
  ): Tenant {
    const businessName = BusinessName.create(businessNameStr);
    const ownerName = OwnerName.create(ownerNameStr);
    const email = Email.create(emailStr);
    const password = Password.create(passwordStr);

    const tenant = new Tenant({
      id: null,
      businessName,
      ownerName,
      email,
      password,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Apply domain event
    tenant.apply(new TenantCreatedEvent(tenant));

    return tenant;
  }

  // Domain logic methods would go here (CUD operations)
}
