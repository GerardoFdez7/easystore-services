import { Command } from '@nestjs/cqrs';
import { WishListMultiStatusDTO } from '../../../../mappers/wish-list/wish-list.dto';

export class DeleteManyWishListDto extends Command<WishListMultiStatusDTO> {
  public readonly customerId: string;
  public readonly variantIds: string[];
  public readonly storeId: string;

  constructor(customerId: string, variantIds: string[], storeId: string) {
    super();
    this.customerId = customerId;
    this.variantIds = variantIds;
    this.storeId = storeId;
  }
}
