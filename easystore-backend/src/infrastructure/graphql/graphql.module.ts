import { Module } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { join } from 'path';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(
        process.cwd(),
        'src/infrastructure/graphql/schema.gql',
      ),
      sortSchema: true,
      playground: false,
      plugins:
        process.env.NODE_ENV !== 'production'
          ? [ApolloServerPluginLandingPageLocalDefault()]
          : [],
      introspection: true,
      context: ({ req }: { req: Request }) => ({ req }),
      path: '/gql',
    }),
  ],
  providers: [],
})
export class GraphqlModule {}
