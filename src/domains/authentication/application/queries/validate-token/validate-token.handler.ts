import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AuthenticationValidateTokenDTO } from './validate-token.dto';
import { verifyToken } from '../../../infrastructure/jwt';
import { ResponseDTO } from '../../mappers';

@QueryHandler(AuthenticationValidateTokenDTO)
export class AuthenticationValidateTokenHandler
  implements IQueryHandler<AuthenticationValidateTokenDTO>
{
  execute(query: AuthenticationValidateTokenDTO): Promise<ResponseDTO> {
    try {
      const { token } = query;

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
