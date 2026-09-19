import { Injectable, Logger } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { Prisma } from '.prisma/postgres';
import { PostgreService } from '@database/postgres.service';

type TransactionState = {
  client: Prisma.TransactionClient;
  afterCommit: Array<() => void>;
};

/** Coordinates a single PostgreSQL transaction across collaborating repositories. */
@Injectable()
export class TransactionManager {
  private readonly storage = new AsyncLocalStorage<TransactionState>();
  private readonly logger = new Logger(TransactionManager.name);

  constructor(private readonly postgres: PostgreService) {}

  get client(): Prisma.TransactionClient | PostgreService {
    return this.storage.getStore()?.client ?? this.postgres;
  }

  get isActive(): boolean {
    return this.storage.getStore() !== undefined;
  }

  async execute<T>(work: () => Promise<T>): Promise<T> {
    if (this.isActive) return work();

    const state = await this.postgres.$transaction(async (client) => {
      const transactionState: TransactionState = { client, afterCommit: [] };
      const result = await this.storage.run(transactionState, work);
      return { result, afterCommit: transactionState.afterCommit };
    });

    this.runAfterCommitCallbacks(state.afterCommit);
    return state.result;
  }

  afterCommit(callback: () => void): void {
    const state = this.storage.getStore();
    if (state) {
      state.afterCommit.push(callback);
      return;
    }
    this.runAfterCommitCallbacks([callback]);
  }

  private runAfterCommitCallbacks(callbacks: Array<() => void>): void {
    callbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        this.logger.error(
          'A post-commit callback failed after the database transaction completed.',
          error instanceof Error ? error.stack : undefined,
        );
      }
    });
  }
}
