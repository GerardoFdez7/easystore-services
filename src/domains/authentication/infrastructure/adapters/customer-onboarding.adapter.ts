import { Injectable } from '@nestjs/common';
import { AuthIdentity } from '../../aggregates/entities';
import { ICustomerOnboarding } from '../../application/ports';
import { CustomerOnboardingService } from '../onboarding';

/** Adapts customer account provisioning to Authentication's application port. */
@Injectable()
export class CustomerOnboardingAdapter implements ICustomerOnboarding {
  constructor(private readonly onboarding: CustomerOnboardingService) {}

  provision(auth: AuthIdentity, storeId: string): Promise<void> {
    return this.onboarding.provision(auth, storeId);
  }
}
