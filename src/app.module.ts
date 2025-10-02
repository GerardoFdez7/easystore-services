import { Module, Global, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { GraphqlModule } from '@graphql/graphql.module';
import { PostgresModule } from '@database/postgres.module';
import MediaModule from '@media/media.module';
import { AuthenticationDomain } from './domains/authentication/authentication.module';
import AuthGuard from './domains/authentication/infrastructure/guard/auth.guard';
import { TenantDomain } from './domains/tenant/tenant.module';
import { ProductDomain } from './domains/product/product.module';
import { CategoryDomain } from './domains/category/category.module';
import { AddressDomain } from './domains/address/address.module';
import { InventoryDomain } from './domains/inventory/inventory.module';
import { LoggerConfig } from './config/logger/logger.config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', `.env.${process.env.NODE_ENV || 'development'}`],
    }),
    LoggerConfig(),
    GraphqlModule,
    PostgresModule,
    MediaModule,
    AuthenticationDomain,
    TenantDomain,
    ProductDomain,
    CategoryDomain,
    AddressDomain,
    InventoryDomain,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(): void {}
}
