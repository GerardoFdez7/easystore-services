export interface CachePort {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  invalidate(key: string): Promise<void>;
  invalidatePattern(pattern: string): Promise<void>;
  addToCart(userId: string, productId: string, quantity: number): Promise<void>;
  getCart(userId: string): Promise<Record<string, number>>;
}
