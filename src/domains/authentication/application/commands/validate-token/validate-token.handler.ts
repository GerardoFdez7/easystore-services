import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthenticationValidateTokenDTO } from './validate-token.dto';
import { verifyToken } from '../../../infrastructure/jwt';
import { ResponseDTO } from '../../mappers';

@CommandHandler(AuthenticationValidateTokenDTO)
export class AuthenticationValidateTokenHandler
  implements ICommandHandler<AuthenticationValidateTokenDTO>
{
  execute(command: AuthenticationValidateTokenDTO): Promise<ResponseDTO> {
    try {
      const { token } = command;

      if (!token) {
        return Promise.resolve({
          success: false,
          message: 'No authentication token provided',
        });
      }

      // Verify the token
      verifyToken(token);

      return Promise.resolve({
        success: true,
        message: 'Token is valid',
      });
    } catch (_error) {
      return Promise.resolve({
        success: false,
        message: 'Token is invalid or expired',
      });
    }
  }
}
