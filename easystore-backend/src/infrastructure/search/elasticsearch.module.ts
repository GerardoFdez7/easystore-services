import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ElasticSearch } from './elasticsearch.service';

@Module({
  imports: [
    ElasticsearchModule.register({
      node: 'http://localhost:9200',
    }),
  ],
  providers: [ElasticSearch],
  exports: [ElasticsearchModule, ElasticSearch],
})
export class ElasticSearchModule {}
