import type { D1Database } from '@cloudflare/workers-types';
import type { Env } from '../types/env';
import { User } from '../types/models';

export class UserService {
  private db: D1Database;

  constructor(private env: Env) {
    this.db = env.DB;
  }

  async createUser(data: {
    email: string;
    password: string;
    username?: string;
  }): Promise<User> {
    const id = crypto.randomUUID();
    const hashedPassword = await this.hashPassword(data.password);
    const now = new Date().toISOString();

    await this.db.prepare(`
      INSERT INTO users (id, email, username, password_hash, created_at)
      VALUES (?, ?, ?, ?, ?)
    `)
    .bind(id, data.email, data.username || null, hashedPassword, now)
    .run();

    return {
      id,
      email: data.email,
      username: data.username,
      created_at: now,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.prepare(`
      SELECT id, email, username, created_at, last_login
      FROM users
      WHERE email = ?
    `)
    .bind(email)
    .first();

    return result as User | null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.db.prepare(`
      SELECT id, email, username, created_at, last_login
      FROM users
      WHERE id = ?
    `)
    .bind(id)
    .first();

    return result as User | null;
  }

  async verifyCredentials(email: string, password: string): Promise<User | null> {
    const result = await this.db.prepare(`
      SELECT id, email, username, password_hash, created_at, last_login
      FROM users
      WHERE email = ?
    `)
    .bind(email)
    .first();

    if (!result) return null;

    const isValid = await this.verifyPassword(password, result.password_hash as string);
    if (!isValid) return null;

    return {
      id: result.id as string,
      email: result.email as string,
      username: result.username as string | undefined,
      created_at: result.created_at as string,
      last_login: result.last_login as string | undefined,
    };
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.db.prepare(`
      UPDATE users
      SET last_login = ?
      WHERE id = ?
    `)
    .bind(new Date().toISOString(), userId)
    .run();
  }

  async getProfile(userId: string): Promise<any> {
    const user = await this.findById(userId);
    if (!user) return null;

    // Get user preferences
    const preferences = await this.db.prepare(`
      SELECT preferences
      FROM user_preferences
      WHERE user_id = ?
    `)
    .bind(userId)
    .first();

    // Get stats
    const stats = await this.db.prepare(`
      SELECT 
        COUNT(*) as total_quizzes,
        COUNT(CASE WHEN shared = 1 THEN 1 END) as shared_quizzes,
        AVG(score) as avg_score
      FROM quiz_results
      WHERE user_id = ?
    `)
    .bind(userId)
    .first();

    return {
      ...user,
      preferences: preferences?.preferences ? JSON.parse(preferences.preferences as string) : {},
      stats: {
        totalQuizzes: stats?.total_quizzes || 0,
        sharedQuizzes: stats?.shared_quizzes || 0,
        averageScore: stats?.avg_score || 0,
      },
    };
  }

  async updateProfile(userId: string, updates: {
    username?: string;
    preferences?: any;
  }): Promise<void> {
    if (updates.username !== undefined) {
      await this.db.prepare(`
        UPDATE users
        SET username = ?
        WHERE id = ?
      `)
      .bind(updates.username, userId)
      .run();
    }

    if (updates.preferences) {
      await this.db.prepare(`
        INSERT INTO user_preferences (user_id, preferences)
        VALUES (?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          preferences = excluded.preferences,
          updated_at = CURRENT_TIMESTAMP
      `)
      .bind(userId, JSON.stringify(updates.preferences))
      .run();
    }
  }

  async deleteUser(userId: string): Promise<void> {
    // Delete in correct order to respect foreign key constraints
    await this.db.batch([
      this.db.prepare('DELETE FROM quiz_results WHERE user_id = ?').bind(userId),
      this.db.prepare('DELETE FROM user_preferences WHERE user_id = ?').bind(userId),
      this.db.prepare('DELETE FROM users WHERE id = ?').bind(userId),
    ]);
  }

  // Password hashing using Web Crypto API
  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + this.env.JWT_SECRET); // Use JWT_SECRET as salt
    const hash = await crypto.subtle.digest('SHA-256', data);
    return this.bufferToHex(hash);
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    const computedHash = await this.hashPassword(password);
    return computedHash === hash;
  }

  private bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}