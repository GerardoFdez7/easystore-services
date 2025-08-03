import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IAuthRepository } from '../../../aggregates/repositories/authentication.interface';
import { UpdatePasswordDTO } from './update-password.dto';
import {
  Email,
  AccountType,
  Password,
} from '../../../aggregates/value-objects';

@CommandHandler(UpdatePasswordDTO)
export class UpdatePasswordHandler
  implements ICommandHandler<UpdatePasswordDTO>
{
  constructor(
    @Inject('AuthRepository')
    private readonly authRepository: IAuthRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdatePasswordDTO): Promise<{ message: string }> {
    const { email, accountType, password } = command.data;

    // Create value objects for validation
    const emailVO = Email.create(email);
    const accountTypeVO = AccountType.create(accountType);
    const passwordVO = Password.create(password);

    // Find the user by email and account type
    const existingUser = await this.authRepository.findByEmailAndAccountType(
      emailVO,
      accountTypeVO,
    );

    if (!existingUser) {
      throw new NotFoundException(
        'User not found with the provided email and account type',
      );
    }

    // Update the user's password using the domain method
    const updatedUser = this.eventPublisher.mergeObjectContext(existingUser);
    updatedUser.updatePassword(passwordVO.getValue());

    // Update in repository
    await this.authRepository.update(existingUser.get('id'), updatedUser);

    // Commit events
    updatedUser.commit();

    return {
      message: 'Password updated successfully',
    };
  }
}
