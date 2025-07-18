import type { KVNamespace } from '@cloudflare/workers-types';

export class CacheService {
  constructor(private kv: KVNamespace) {}

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.kv.get(key);
      if (!value) return null;
      
      // Try to parse as JSON, otherwise return as is
      try {
        return JSON.parse(value);
      } catch {
        return value as T;
      }
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      
      const options: KVNamespacePutOptions = {};
      if (ttl) {
        options.expirationTtl = ttl;
      }
      
      await this.kv.put(key, serialized, options);
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.kv.delete(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const value = await this.kv.get(key);
      return value !== null;
    } catch (error) {
      console.error(`Cache has error for key ${key}:`, error);
      return false;
    }
  }

  async getWithMetadata<T = any>(key: string): Promise<{ value: T | null; metadata: any }> {
    try {
      const result = await this.kv.getWithMetadata(key);
      if (!result.value) return { value: null, metadata: null };
      
      // Try to parse as JSON
      try {
        const value = JSON.parse(result.value as string);
        return { value, metadata: result.metadata };
      } catch {
        return { value: result.value as T, metadata: result.metadata };
      }
    } catch (error) {
      console.error(`Cache getWithMetadata error for key ${key}:`, error);
      return { value: null, metadata: null };
    }
  }

  async list(prefix?: string, limit = 1000): Promise<string[]> {
    try {
      const result = await this.kv.list({ prefix, limit });
      return result.keys.map(key => key.name);
    } catch (error) {
      console.error(`Cache list error for prefix ${prefix}:`, error);
      return [];
    }
  }

  // Helper methods for specific cache patterns
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.list(pattern);
      await Promise.all(keys.map(key => this.delete(key)));
    } catch (error) {
      console.error(`Cache invalidatePattern error for pattern ${pattern}:`, error);
    }
  }

  // Specific cache key generators
  generateQuizCacheKey(type: string, theme?: string, difficulty?: string): string {
    const parts = ['quiz', type];
    if (theme) parts.push(theme.toLowerCase().replace(/\s+/g, '-'));
    if (difficulty) parts.push(difficulty);
    return parts.join(':');
  }

  generateResultCacheKey(resultId: string): string {
    return `result:${resultId}`;
  }

  generateSessionCacheKey(sessionId: string): string {
    return `session:${sessionId}`;
  }

  generateUserCacheKey(userId: string): string {
    return `user:${userId}`;
  }

  generateDailyCacheKey(type: string = 'quiz'): string {
    const date = new Date().toISOString().split('T')[0];
    return `daily:${type}:${date}`;
  }
}