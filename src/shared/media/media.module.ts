import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import MediaService from './media.service';
import MediaResolver from './graphql/media.resolver';

@Module({
  imports: [ConfigModule],
  providers: [MediaService, MediaResolver],
  exports: [MediaService],
})
export default class MediaModule {}
