import { getRedisClient } from '../config/redis.js';

const deserialize = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn('[Redis] Cache deserialize failed:', error.message);
    return null;
  }
};

export const getCache = async (key) => {
  const redis = getRedisClient();

  if (!redis) {
    console.warn(`[Redis] Cache MISS ${key} - Redis is not configured`);
    return null;
  }

  try {
    const cached = await redis.get(key);
    if (cached === null || cached === undefined) {
      console.log(`[Redis] Cache MISS ${key}`);
      return null;
    }

    console.log(`[Redis] Cache HIT ${key}`);
    return deserialize(cached);
  } catch (error) {
    console.error(`[Redis] Connection error while reading ${key}:`, error.message);
    return null;
  }
};

export const setCache = async (key, value, ttlSeconds) => {
  const redis = getRedisClient();

  if (!redis) {
    return false;
  }

  try {
    await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
    console.log(`[Redis] Cache SET ${key} (${ttlSeconds}s)`);
    return true;
  } catch (error) {
    console.error(`[Redis] Connection error while writing ${key}:`, error.message);
    return false;
  }
};

export const deleteCache = async (key) => {
  const redis = getRedisClient();

  if (!redis) {
    return false;
  }

  try {
    await redis.del(key);
    console.log(`[Redis] Cache DELETE ${key}`);
    return true;
  } catch (error) {
    console.error(`[Redis] Connection error while deleting ${key}:`, error.message);
    return false;
  }
};
