import { Injectable } from '@nestjs/common';
import { AuthIdentity } from '../../aggregates/entities';
import { ITenantOnboarding } from '../../application/ports';
import { TenantOnboardingService } from '../onboarding';

/** Adapts tenant account provisioning to Authentication's application port. */
@Injectable()
export class TenantOnboardingAdapter implements ITenantOnboarding {
  constructor(private readonly onboarding: TenantOnboardingService) {}

  provision(auth: AuthIdentity, initialDomain?: string): Promise<void> {
    return this.onboarding.provision(auth, initialDomain);
  }
}
