import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetInTouchDTO } from './get-in-touch.dto';
import { Inject } from '@nestjs/common';
import { AuthEmailService } from '@authentication/infrastructure/emails';

@CommandHandler(GetInTouchDTO)
export class GetInTouchHandler implements ICommandHandler<GetInTouchDTO> {
  constructor(
    @Inject('AuthEmailService')
    private readonly emailService: AuthEmailService,
  ) {}

  async execute(_command: GetInTouchDTO): Promise<void> {}
}
