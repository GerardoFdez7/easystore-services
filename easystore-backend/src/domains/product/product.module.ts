import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { LoggerService } from '@shared/winston/winston.service';
import { MongoService } from '@database/mongo/mongo.service';

@Module({
  imports: [CqrsModule, MongoService, LoggerService],
})
export class ProductModule {}
