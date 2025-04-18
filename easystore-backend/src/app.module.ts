import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphqlModule } from '@graphql/graphql.module';
import { LoggerModule } from '@logging/winston/winston.module';
import { ClientModule } from './modules/client/client.module';

@Module({
  imports: [GraphqlModule, ClientModule, LoggerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
