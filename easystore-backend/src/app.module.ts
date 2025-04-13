import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphqlModule } from './infrastructure/graphql/graphql.module';
import { ClientResolver } from './modules/client/client.resolver';

@Module({
  imports: [GraphqlModule, ClientResolver],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
