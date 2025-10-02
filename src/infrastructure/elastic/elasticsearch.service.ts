import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class ElasticSearch {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async indexDocument(
    index: string,
    document: Record<string, unknown>,
  ): Promise<unknown> {
    try {
      const result = await this.elasticsearchService.index({
        index,
        body: document,
      });
      logger.log(`Document indexed successfully in index "${index}"`);
      return result;
    } catch (error) {
      logger.error(
        `Failed to index document in index "${index}"`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async search(
    index: string,
    query: Record<string, unknown>,
  ): Promise<unknown> {
    try {
      const results = await this.elasticsearchService.search({
        index,
        body: query,
      });
      logger.log(`Search successful in index "${index}"`);
      return results.hits.hits;
    } catch (error) {
      logger.error(
        `Failed to search in index "${index}"`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
