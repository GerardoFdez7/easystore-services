import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { PaymentProviderTypeVO } from '../../aggregates/value-objects/payment-provider-type.vo';
import {
  CreatePaymentCredentialsInput,
  UpdatePaymentCredentialsInput,
  DeletePaymentCredentialsInput,
  PaymentCredentialsResponse,
} from './types/payment-credentials.types';
import { CreatePaymentCredentialsCommand } from '../../application/commands/payment-credentials/create-payment-credentials.handler';
import { UpdatePaymentCredentialsCommand } from '../../application/commands/payment-credentials/update-payment-credentials.handler';
import { DeletePaymentCredentialsCommand } from '../../application/commands/payment-credentials/delete-payment-credentials.handler';
import { GetPaymentCredentialsQuery } from '../../application/queries/payment-credentials/get-payment-credentials.handler';
import { CreatePaymentCredentialsDto } from '../../application/commands/payment-credentials/create-payment-credentials.dto';
import { UpdatePaymentCredentialsDto } from '../../application/commands/payment-credentials/update-payment-credentials.dto';
import { DeletePaymentCredentialsDto } from '../../application/commands/payment-credentials/delete-payment-credentials.dto';
import { GetPaymentCredentialsDto } from '../../application/queries/payment-credentials/get-payment-credentials.dto';

@Resolver()
export class PaymentCredentialsResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Mutation(() => Boolean)
  async createPaymentCredentials(
    @Args('input') input: CreatePaymentCredentialsInput,
  ): Promise<boolean> {
    const credentials = this.extractCredentials(input);
    const providerType = PaymentProviderTypeVO.create(input.providerType);

    const command = new CreatePaymentCredentialsCommand(
      new CreatePaymentCredentialsDto(
        input.tenantId,
        providerType,
        credentials,
      ),
    );

    await this.commandBus.execute(command);
    return true;
  }

  @Mutation(() => Boolean)
  async updatePaymentCredentials(
    @Args('input') input: UpdatePaymentCredentialsInput,
  ): Promise<boolean> {
    const credentials = this.extractCredentials(input);
    const providerType = PaymentProviderTypeVO.create(input.providerType);

    const command = new UpdatePaymentCredentialsCommand(
      new UpdatePaymentCredentialsDto(
        input.tenantId,
        providerType,
        credentials,
      ),
    );

    await this.commandBus.execute(command);
    return true;
  }

  @Mutation(() => Boolean)
  async deletePaymentCredentials(
    @Args('input') input: DeletePaymentCredentialsInput,
  ): Promise<boolean> {
    const providerType = PaymentProviderTypeVO.create(input.providerType);

    const command = new DeletePaymentCredentialsCommand(
      new DeletePaymentCredentialsDto(input.tenantId, providerType),
    );

    await this.commandBus.execute(command);
    return true;
  }

  @Query(() => [PaymentCredentialsResponse])
  async getPaymentCredentials(
    @Args('tenantId') tenantId: string,
    @Args('providerType', { nullable: true }) providerType?: string,
  ): Promise<PaymentCredentialsResponse[]> {
    const query = new GetPaymentCredentialsQuery(
      new GetPaymentCredentialsDto(
        tenantId,
        providerType ? PaymentProviderTypeVO.create(providerType) : undefined,
      ),
    );

    const result = (await this.queryBus.execute(query)) as unknown;
    if (Array.isArray(result)) {
      return result as PaymentCredentialsResponse[];
    }
    return [result as PaymentCredentialsResponse];
  }

  private extractCredentials(
    input: CreatePaymentCredentialsInput | UpdatePaymentCredentialsInput,
  ): Record<string, unknown> {
    if (input.pagaditoCredentials) {
      return {
        uid: input.pagaditoCredentials.uid,
        wsk: input.pagaditoCredentials.wsk,
        sandbox: input.pagaditoCredentials.sandbox ?? true,
      };
    }

    if (input.visanetCredentials) {
      return {
        merchantId: input.visanetCredentials.merchantId,
        merchantKeyId: input.visanetCredentials.merchantKeyId,
        merchantSecretKey: input.visanetCredentials.merchantSecretKey,
        environment: input.visanetCredentials.environment,
      };
    }

    if (input.paypalCredentials) {
      return {
        clientId: input.paypalCredentials.clientId,
        clientSecret: input.paypalCredentials.clientSecret,
      };
    }

    throw new Error('No credentials provided');
  }
}
