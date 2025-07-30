import { Injectable } from '@nestjs/common';
import { PostgreService } from '@database/postgres.service';
import { ICustomerRepository } from '../../../aggregates/repositories/customer.interface';
import { Id } from '../../../aggregates/value-objects';

@Injectable()
export class CustomerRepository implements ICustomerRepository {
  constructor(private readonly prisma: PostgreService) {}

  /**
   * Finds a customer by its auth identity ID.
   */
  async findByAuthIdentityId(
    authIdentityId: Id,
  ): Promise<{ id: string; tenantId: string } | null> {
    const authIdentityIdValue = authIdentityId.getValue();

    try {
      const customer = await this.prisma.customer.findFirst({
        where: {
          authIdentityId: authIdentityIdValue,
        },
        select: {
          id: true,
          tenantId: true,
        },
      });

      return customer;
    } catch (_error) {
      // Log error and return null for now
      return null;
    }
  }
}
