export interface Env {
  // Workers AI
  AI: Ai;
  
  // D1 Database
  DB: D1Database;
  
  // KV Namespaces
  CACHE: KVNamespace;
  SESSIONS: KVNamespace;
  
  // R2 Bucket
  STORAGE: R2Bucket;
  
  // Durable Objects
  RATE_LIMITER: DurableObjectNamespace;
  
  // Static Assets
  ASSETS: Fetcher;
  
  // Environment Variables
  ENVIRONMENT: string;
  JWT_SECRET: string;
  DEEPSEEK_API_KEY: string;
  OPENROUTER_API_KEY: string;
}

export interface Context {
  Variables: {
    user?: {
      id: string;
      email: string;
      username?: string;
    };
  };
  Bindings: Env;
}