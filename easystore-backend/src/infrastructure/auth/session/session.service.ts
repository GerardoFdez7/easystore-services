import { Injectable } from '@nestjs/common';
import { RedisCacheAdapter } from '@infrastructure/cache/adapters/redis-cache.adapter';

interface SessionData {
  userId: number;
  clientId: number;
  roles: string[];
  permissions: string[];
  lastActivity: Date;
  [key: string]: unknown;
}

@Injectable()
export class SessionService {
  private readonly sessionPrefix = 'session:';
  private readonly sessionTtl = 86400;
  constructor(private readonly cacheAdapter: RedisCacheAdapter) {}

  async createSession(
    sessionId: string,
    data: Omit<SessionData, 'lastActivity'>,
  ): Promise<string> {
    const sessionData: SessionData = {
      ...data,
      lastActivity: new Date(),
      userId: 0,
      clientId: 0,
      roles: [],
      permissions: [],
    };

    const key = this.getSessionKey(sessionId);
    await this.cacheAdapter.set(key, sessionData, this.sessionTtl);

    return sessionId;
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    const key = this.getSessionKey(sessionId);
    const session = await this.cacheAdapter.get<SessionData>(key);

    if (session) {
      session.lastActivity = new Date();
      await this.cacheAdapter.set(key, session, this.sessionTtl);
    }

    return session;
  }

  async updateSession(
    sessionId: string,
    data: Partial<SessionData>,
  ): Promise<void> {
    const key = this.getSessionKey(sessionId);
    const session = await this.cacheAdapter.get<SessionData>(key);

    if (session) {
      const updatedSession: SessionData = {
        ...session,
        ...data,
        lastActivity: new Date(),
      };

      await this.cacheAdapter.set(key, updatedSession, this.sessionTtl);
    }
  }

  async destroySession(sessionId: string): Promise<void> {
    const key = this.getSessionKey(sessionId);
    await this.cacheAdapter.invalidate(key);
  }

  async touchSession(sessionId: string): Promise<void> {
    const key = this.getSessionKey(sessionId);
    const session = await this.cacheAdapter.get<SessionData>(key);

    if (session) {
      session.lastActivity = new Date();
      await this.cacheAdapter.set(key, session, this.sessionTtl);
    }
  }

  private getSessionKey(sessionId: string): string {
    return `${this.sessionPrefix}${sessionId}`;
  }
}
