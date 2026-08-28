import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { Request, Response } from 'express';
import { join } from 'path';
import { formatGraphqlError } from './utils/error-formatter';
import { createOperationLimitRule } from './utils/validation-rules';

const operationLimitRule = createOperationLimitRule({
  maxDepth: 10,
  maxFields: 250,
});

export function createGraphqlOptions(
  configService: ConfigService,
): ApolloDriverConfig {
  const isDevelopment = configService.get<string>('NODE_ENV') === 'development';

  return {
    autoSchemaFile: join(
      process.cwd(),
      'src/infrastructure/graphql/schema.gql',
    ),
    sortSchema: true,
    playground: false,
    plugins: isDevelopment ? [ApolloServerPluginLandingPageLocalDefault()] : [],
    introspection: isDevelopment,
    includeStacktraceInErrorResponses: isDevelopment,
    csrfPrevention: true,
    allowBatchedHttpRequests: false,
    validationRules: [operationLimitRule],
    formatError: formatGraphqlError,
    context: ({ req, res }: { req: Request; res: Response }) => ({ req, res }),
    path: '/gql',
  };
}

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: createGraphqlOptions,
    }),
  ],
  providers: [],
})
export class GraphqlModule {}
