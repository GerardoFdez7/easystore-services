import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphqlModule } from '@graphql/graphql.module';
import { ClientResolver } from './modules/client/client.resolver';
import { LoggerModule } from '@logging/winston/winston.module';

@Module({
  imports: [GraphqlModule, ClientResolver, LoggerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
