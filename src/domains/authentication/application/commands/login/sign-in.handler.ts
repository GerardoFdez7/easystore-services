import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import {
  Inject,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import {
  generateToken,
  generateRefreshToken,
  JwtPayload,
} from '../../../infrastructure/strategies';
import { IEmployeeRepository } from '../../../aggregates/repositories/employee.interface';
import { IAuthRepository } from '../../../aggregates/repositories/authentication.interface';
import { ICustomerAdapter, IStoreAdapter, ITenantAdapter } from '../../ports';
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
    @Inject('ITenantAdapter')
    private readonly tenantAdapter: ITenantAdapter,
    @Inject('ICustomerAdapter')
    private readonly customerAdapter: ICustomerAdapter,
    @Inject('IStoreAdapter')
    private readonly storeAdapter: IStoreAdapter,
    @Inject('EmployeeRepository')
    private readonly employeeRepository: IEmployeeRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: AuthenticationLoginDTO): Promise<ResponseDTO> {
    const { data } = command;

    const emailVO = Email.create(data.email);
    const accountTypeVO = AccountType.create(data.accountType);

    // Domain is required for CUSTOMER/EMPLOYEE sign-in so the tenant can be resolved.
    const requiresDomain =
      accountTypeVO.getValue() === AccountTypeEnum.CUSTOMER ||
      accountTypeVO.getValue() === AccountTypeEnum.EMPLOYEE;

    if (requiresDomain && !data.domain) {
      throw new BadRequestException(
        'Domain is required for customer and employee sign-in',
      );
    }

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

    // Get authIdentity ID
    const authIdentityId = auth.get('id');
    const authIdentityIdValue = authIdentityId.getValue();

    // Initialize payload with common fields
    let tenantId: string;
    let storeId: string;
    let customerId: string | undefined;
    let employeeId: string | undefined;

    // Determine IDs based on account type
    if (accountTypeVO.getValue() === AccountTypeEnum.TENANT) {
      const loginContext =
        await this.tenantAdapter.resolveTenantLoginContext(authIdentityIdValue);
      if (!loginContext) {
        throw new NotFoundException('Tenant not found for this auth identity');
      }
      tenantId = loginContext.tenantId;
      storeId = loginContext.storeId;
    } else if (accountTypeVO.getValue() === AccountTypeEnum.CUSTOMER) {
      const store = await this.storeAdapter.getStoreByDomain(data.domain);
      if (!store) {
        throw new NotFoundException('Store not found for this domain');
      }

      // For customers, find customer and cross-check it belongs to the resolved tenant
      const customer =
        await this.customerAdapter.findByAuthIdentityId(authIdentityIdValue);
      if (!customer || customer.storeId !== store.id) {
        throw new NotFoundException(
          'Customer not found for this auth identity',
        );
      }
      tenantId = store.tenantId;
      storeId = store.id;
      customerId = customer.id;
    } else if (accountTypeVO.getValue() === AccountTypeEnum.EMPLOYEE) {
      const store = await this.storeAdapter.getStoreByDomain(data.domain);
      if (!store) {
        throw new NotFoundException('Store not found for this domain');
      }

      // For employees, find employee and cross-check it belongs to the resolved tenant
      const employee =
        await this.employeeRepository.findByAuthIdentityId(authIdentityId);
      if (
        !employee ||
        employee.storeId !== store.id ||
        employee.tenantId !== store.tenantId
      ) {
        throw new NotFoundException(
          'Employee not found for this auth identity',
        );
      }
      tenantId = store.tenantId;
      storeId = store.id;
      employeeId = employee.id;
    } else {
      throw new UnauthorizedException('Invalid account type');
    }

    auth.loginSucceeded();
    await this.authRepository.update(IdVO, auth);

    // Generate tokens with enhanced payload
    const payload: JwtPayload = {
      email: emailVO.getValue(),
      accountType: accountTypeVO.getValue(),
      authIdentityId: authIdentityIdValue,
      tenantId,
      storeId,
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
