import { Injectable } from '@nestjs/common';

@Injectable()
export class EventSerializer {
  serialize<T>(data: T): Buffer {
    try {
      return Buffer.from(JSON.stringify(data));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Error serializing event: ${errorMessage}`);
    }
  }

  deserialize<T>(buffer: Buffer | null): T {
    if (!buffer) {
      throw new Error('Cannot deserialize null buffer');
    }

    try {
      return JSON.parse(buffer.toString()) as T;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Error deserializing event: ${errorMessage}`);
    }
  }
}
