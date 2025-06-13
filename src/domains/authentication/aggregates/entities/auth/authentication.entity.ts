import { Entity, EntityProps } from '@domains/entity.base';
import { IAuthIdentityBaseType } from '../';
import {
  Email,
  Password,
  AccountType,
  IsActive,
  EmailVerified,
  Id,
} from '../../value-objects';
import { AuthenticationLoginEvent } from '../../events/authentication-login.event';
import { AuthenticationRegisterEvent } from '../../events/authentication-register.event';

export interface IAuthIdentityProps extends EntityProps {
  id: Id;
  email: Email;
  password: Password;
  accountType: AccountType;
  isActive: IsActive;
  emailVerified: EmailVerified;
  lastLoginAt?: Date;
  failedAttempts: number;
  lockedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class AuthIdentity extends Entity<IAuthIdentityProps> {
  constructor(props: IAuthIdentityProps) {
    super(props);
  }

  static register(input: IAuthIdentityBaseType): AuthIdentity {
    const now = new Date();

    const transformedProps = {
      email: Email.create(input.email),
      password: Password.create(input.password),
      accountType: AccountType.create(input.accountType),
    };

    const auth = new AuthIdentity({
      id: Id.generate(),
      ...transformedProps,
      isActive: IsActive.create(true),
      emailVerified: EmailVerified.create(false),
      lastLoginAt: null,
      failedAttempts: 0,
      lockedUntil: null,
      createdAt: now,
      updatedAt: now,
    });

    auth.apply(new AuthenticationRegisterEvent(auth));
    return auth;
  }

  public loginSucceeded(): void {
    this.props.failedAttempts = 0;
    this.props.lastLoginAt = new Date();
    this.props.lockedUntil = null;
    this.touch();
    this.apply(new AuthenticationLoginEvent(this));
  }

  public loginFailed(): void {
    this.props.failedAttempts += 1;
    if (this.props.failedAttempts >= 5) {
      this.props.lockedUntil = new Date(Date.now() + 10 * 60 * 1000); // lock 10 mins
    }
    this.touch();
  }

  public verifyEmail(): void {
    this.props.emailVerified = EmailVerified.create(true);
    this.touch();
  }

  public deactivate(): void {
    this.props.isActive = IsActive.create(false);
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}
