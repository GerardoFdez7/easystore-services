import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import {
  Inject,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  generateToken,
  generateRefreshToken,
  JwtPayload,
} from '../../../infrastructure/jwt';
import { ICustomerRepository } from '../../../aggregates/repositories/customer.interface';
import { IEmployeeRepository } from '../../../aggregates/repositories/employee.interface';
import { IAuthRepository } from '../../../aggregates/repositories/authentication.interface';
import { ITenantRepository } from '../../../../tenant/aggregates/repositories/tenant.interface';
import { ResponseDTO } from '../../mappers';
import {
  Id,
  Email,
  AccountType,
  AccountTypeEnum,
} from '../../../aggregates/value-objects';
import { AuthenticationLoginDTO } from './sign-in.dto';

@CommandHandler(AuthenticationLoginDTO)
export class AuthenticationLoginHandler
  implements ICommandHandler<AuthenticationLoginDTO>
{
  constructor(
    @Inject('AuthRepository')
    private readonly authRepository: IAuthRepository,
    @Inject('ITenantRepository')
    private readonly tenantRepository: ITenantRepository,
    @Inject('CustomerRepository')
    private readonly customerRepository: ICustomerRepository,
    @Inject('EmployeeRepository')
    private readonly employeeRepository: IEmployeeRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: AuthenticationLoginDTO): Promise<ResponseDTO> {
    const { data } = command;

    const emailVO = Email.create(data.email);
    const accountTypeVO = AccountType.create(data.accountType);

    // Get user with account type
    const authEntity = await this.authRepository.findByEmailAndAccountType(
      emailVO,
      accountTypeVO,
    );

    if (!authEntity) {
      // Prevent timing attacks by still hashing a dummy password
      await bcrypt.compare(
        'dummy',
        '$2b$10$dummy.hash.to.prevent.timing.attacks',
      );
      throw new NotFoundException('Invalid credentials');
    }

    const auth = this.eventPublisher.mergeObjectContext(authEntity);

    // Check if account is locked
    const lockedUntil = auth.get('lockedUntil');
    if (lockedUntil && new Date() < lockedUntil) {
      throw new ForbiddenException('Account is temporarily locked');
    }

    // Validate credentials
    const storedPassword = auth.get('password').getValue();
    const areCredentialsValid = await bcrypt.compare(
      data.password,
      storedPassword,
    );

    const id = auth.get('id').getValue();
    const IdVO = Id.create(id);

    if (!areCredentialsValid) {
      auth.loginFailed();
      await this.authRepository.update(IdVO, auth);
      auth.commit();
      throw new UnauthorizedException('Invalid credentials');
    }

    // Success flow
    auth.loginSucceeded();
    await this.authRepository.update(IdVO, auth);

    // Get authIdentity ID
    const authIdentityId = auth.get('id');
    const authIdentityIdValue = authIdentityId.getValue();

    // Initialize payload with common fields
    let tenantId: string;
    let customerId: string | undefined;
    let employeeId: string | undefined;

    // Determine IDs based on account type
    if (accountTypeVO.getValue() === AccountTypeEnum.TENANT) {
      // For tenants, find the tenant entity
      const tenant =
        await this.tenantRepository.findByAuthIdentityId(authIdentityId);
      if (!tenant) {
        throw new NotFoundException('Tenant not found for this auth identity');
      }
      tenantId = tenant.get('id').getValue();
    } else if (accountTypeVO.getValue() === AccountTypeEnum.CUSTOMER) {
      // For customers, find customer and tenant
      const customer =
        await this.customerRepository.findByAuthIdentityId(authIdentityId);
      if (!customer) {
        throw new NotFoundException(
          'Customer not found for this auth identity',
        );
      }
      tenantId = customer.tenantId;
      customerId = customer.id;
    } else if (accountTypeVO.getValue() === AccountTypeEnum.EMPLOYEE) {
      // For employees, find employee and tenant
      const employee =
        await this.employeeRepository.findByAuthIdentityId(authIdentityId);
      if (!employee) {
        throw new NotFoundException(
          'Employee not found for this auth identity',
        );
      }
      tenantId = employee.tenantId;
      employeeId = employee.id;
    } else {
      throw new UnauthorizedException('Invalid account type');
    }

    // Generate tokens with enhanced payload
    const payload: JwtPayload = {
      email: emailVO.getValue(),
      authIdentityId: authIdentityIdValue,
      tenantId,
      customerId,
      employeeId,
    };

    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    auth.commit();

    return {
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
    };
  }
}
