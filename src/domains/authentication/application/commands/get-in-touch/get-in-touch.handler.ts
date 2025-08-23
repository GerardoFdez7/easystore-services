import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetInTouchDTO } from './get-in-touch.dto';
import { Inject } from '@nestjs/common';
import { AuthEmailService } from '@authentication/infrastructure/emails';
import { ResponseDTO } from '../../mappers';

@CommandHandler(GetInTouchDTO)
export class GetInTouchHandler implements ICommandHandler<GetInTouchDTO> {
  constructor(
    @Inject('AuthEmailService')
    private readonly emailService: AuthEmailService,
  ) {}

  async execute(command: GetInTouchDTO): Promise<ResponseDTO> {
    // Send the get in touch email with locale
    await this.emailService.sendGetInTouchEmail(command);

    return {
      success: true,
      message: 'Thank you for contacting us. We will get back to you soon!',
    };
  }
}
