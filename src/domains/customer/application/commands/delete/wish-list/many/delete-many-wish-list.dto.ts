import { Command } from '@nestjs/cqrs';
import { WishListMultiStatusDTO } from '../../../../mappers/wish-list/wish-list.dto';

export class DeleteManyWishListDto extends Command<WishListMultiStatusDTO> {
  public readonly customerId: string;
  public readonly variantIds: string[];
  public readonly tenantId: string;

  constructor(customerId: string, variantIds: string[], tenantId: string) {
    super();
    this.customerId = customerId;
    this.variantIds = variantIds;
    this.tenantId = tenantId;
  }
}
