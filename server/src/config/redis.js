import { Redis } from '@upstash/redis';

let redis = undefined;

export const getRedisClient = () => {
  if (redis !== undefined) {
    return redis;
  }

  const { REDIS_URL, REDIS_TOKEN } = process.env;

  if (!REDIS_URL || !REDIS_TOKEN) {
    console.warn('[Redis] Configuration error: REDIS_URL and REDIS_TOKEN are required for cache access');
    redis = null;
    return redis;
  }

  redis = new Redis({
    url: REDIS_URL,
    token: REDIS_TOKEN,
  });

  return redis;
};

export const verifyRedisConnection = async () => {
  const client = getRedisClient();

  if (!client) {
    console.warn('[Redis] Startup verification skipped: Redis is not configured');
    return false;
  }

  try {
    await client.ping();
    console.log('[Redis] Connected successfully');
    return true;
  } catch (error) {
    console.error('[Redis] Connection error:', error.message);
    return false;
  }
};

export default getRedisClient;
