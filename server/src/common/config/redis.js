import './env.js';
import Redis from 'ioredis';

/**
 * Checks if Redis configuration exists in environment variables
 */
export const isRedisConfigured = Boolean(
  process.env.REDIS_URL ||
    (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) ||
    process.env.REDIS_HOST
);

/**
 * Builds Redis connection configuration from available environment variables.
 * Supports:
 * 1. Standard REDIS_URL (e.g., rediss://default:...@host:6379 or redis://127.0.0.1:6379)
 * 2. Upstash credentials (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN)
 * 3. Individual REDIS_HOST / REDIS_PORT / REDIS_PASSWORD parameters
 */
function getRedisConfig() {
  const commonOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    retryStrategy(times) {
      const delay = Math.min(times * 100, 3000);
      return delay;
    },
  };

  if (process.env.REDIS_URL) {
    return {
      connectionUrl: process.env.REDIS_URL,
      options: commonOptions,
    };
  }

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const url = new URL(process.env.UPSTASH_REDIS_REST_URL);
      return {
        connectionUrl: null,
        options: {
          ...commonOptions,
          host: url.hostname,
          port: Number(process.env.REDIS_PORT) || 6379,
          password: process.env.UPSTASH_REDIS_REST_TOKEN,
          tls: {},
        },
      };
    } catch (err) {
      console.warn('⚠️ Invalid UPSTASH_REDIS_REST_URL format:', err.message);
    }
  }

  return {
    connectionUrl: null,
    options: {
      ...commonOptions,
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      lazyConnect: !isRedisConfigured,
    },
  };
}

const { connectionUrl, options } = getRedisConfig();

export const redis = connectionUrl ? new Redis(connectionUrl, options) : new Redis(options);

redis.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err.message || err);
});

/**
 * Tests connection to Redis by sending a PING command.
 */
export const connectRedis = async () => {
  const pong = await redis.ping();
  console.log(`✅ Connected to Redis successfully (PING: ${pong})`);
  return pong;
};

export default redis;

