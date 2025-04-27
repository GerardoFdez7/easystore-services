import { RecordMetadata } from 'kafkajs';

export interface MessageProducerPort {
  send<T>(
    topic: string,
    message: T,
    key?: string,
    headers?: Record<string, string>,
  ): Promise<RecordMetadata[]>;
  sendBatch<T>(
    topic: string,
    messages: T[],
    getKey?: (message: T) => string,
  ): Promise<RecordMetadata[]>;
  sendTransaction<T>(
    topicMessages: Array<{ topic: string; message: T; key?: string }>,
  ): Promise<void>;
}
