import { Injectable } from '@nestjs/common';
import { PostgreService } from '@database/postgres.service';
import { Prisma, Store as PrismaStore } from '.prisma/postgres';
import { Id } from '@shared/aggregates/value-objects';
import { handlePrismaDatabaseError } from '@shared/infrastructure/postgres/prisma-error-utils';
import { Store, IStoreType } from '../../aggregates/entities';
import { IStoreRepository, StorePage } from '../../aggregates/repositories';
import { StoreMapper } from '../../application/mappers';

@Injectable()
export default class StoreRepository implements IStoreRepository {
  constructor(private readonly prisma: PostgreService) {}
  async create(store: Store): Promise<Store> {
    const data = StoreMapper.toDto(store);
    const createData: Prisma.StoreUncheckedCreateInput = {
      id: data.id,
      tenantId: data.tenantId,
      name: data.name,
      domain: data.domain,
      logo: data.logo,
      description: data.description,
      currency: data.currency,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
    try {
      const saved = await this.prisma.$transaction((tx) =>
        tx.store.create({ data: createData }),
      );
      return this.map(saved);
    } catch (error) {
      return this.fail(error, 'create store');
    }
  }
  async update(id: Id, tenantId: Id, store: Store): Promise<Store> {
    const data = StoreMapper.toDto(store);
    try {
      const saved = await this.prisma.$transaction((tx) =>
        tx.store.update({
          where: {
            id_tenantId: { id: id.getValue(), tenantId: tenantId.getValue() },
          },
          data: {
            name: data.name,
            domain: data.domain,
            logo: data.logo,
            description: data.description,
            currency: data.currency,
          },
        }),
      );
      return this.map(saved);
    } catch (error) {
      return this.fail(error, 'update store');
    }
  }
  async findByIdAndTenantId(id: Id, tenantId: Id): Promise<Store | null> {
    try {
      const store = await this.prisma.store.findUnique({
        where: {
          id_tenantId: { id: id.getValue(), tenantId: tenantId.getValue() },
        },
      });
      return store ? this.map(store) : null;
    } catch (error) {
      return this.fail(error, 'find store by tenant ownership');
    }
  }
  async findByDomain(domain: string): Promise<Store | null> {
    try {
      const store = await this.prisma.store.findUnique({ where: { domain } });
      return store ? this.map(store) : null;
    } catch (error) {
      return this.fail(error, 'find store by domain');
    }
  }
  async findAllByTenantId(
    tenantId: Id,
    page: number,
    limit: number,
  ): Promise<StorePage> {
    try {
      const where = { tenantId: tenantId.getValue() };
      const [stores, total] = await this.prisma.$transaction([
        this.prisma.store.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        }),
        this.prisma.store.count({ where }),
      ]);
      return { stores: stores.map((store) => this.map(store)), total };
    } catch (error) {
      return this.fail(error, 'list tenant stores');
    }
  }
  private map(store: PrismaStore): Store {
    return StoreMapper.fromPersistence(store as IStoreType);
  }
  private fail(error: unknown, operation: string): never {
    return handlePrismaDatabaseError(error, operation, {
      resource: 'Store',
      foreignKeyEntities: { tenantId: 'Tenant' },
    });
  }
}
