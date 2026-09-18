import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AccountTypeEnum } from '../../../aggregates/value-objects';
import { ResponseDTO } from '../../mappers';
import { IStoreAdapter } from '../../ports';
import { generateToken } from '../../../infrastructure/strategies';
import { SwitchStoreDTO } from './switch-store.dto';

@CommandHandler(SwitchStoreDTO)
export class SwitchStoreHandler implements ICommandHandler<SwitchStoreDTO> {
  constructor(
    @Inject('IStoreAdapter') private readonly storeAdapter: IStoreAdapter,
  ) {}

  async execute(command: SwitchStoreDTO): Promise<ResponseDTO> {
    if (command.user.accountType !== AccountTypeEnum.TENANT) {
      throw new ForbiddenException('This operation is not authorized');
    }

    const store = await this.storeAdapter.validateStoreInTenant(
      command.storeId,
      command.user.tenantId,
    );
    if (!store) throw new NotFoundException('Store not found');

    return {
      success: true,
      message: 'Store switched successfully',
      accessToken: generateToken({
        ...command.user,
        storeId: store.id,
      }),
    };
  }
}
