let client = null;
let isReady = false;

if (process.env.REDIS_URL) {
  const redis = require('redis');
  client = redis.createClient({ url: process.env.REDIS_URL });
  client.on('ready', () => { isReady = true; });
  client.on('error', (err) => { console.error('Redis error:', err.message); isReady = false; });
  client.connect().catch((err) => console.error('No se pudo conectar a Redis:', err.message));
}

// Fallback en memoria para entornos sin Redis
const inMemoryLocks = new Map();

const acquireSeatLock = async (seatId, ttlMs = 300000) => {
  const key = `seat:${seatId}`;

  if (isReady && client) {
    const result = await client.set(key, '1', { NX: true, PX: ttlMs });
    return result === 'OK';
  }

  if (inMemoryLocks.has(key)) return false;
  const timer = setTimeout(() => inMemoryLocks.delete(key), ttlMs);
  inMemoryLocks.set(key, timer);
  return true;
};

const releaseSeatLock = async (seatId) => {
  const key = `seat:${seatId}`;

  if (isReady && client) {
    await client.del(key);
    return;
  }

  const timer = inMemoryLocks.get(key);
  if (timer) clearTimeout(timer);
  inMemoryLocks.delete(key);
};

module.exports = { acquireSeatLock, releaseSeatLock };
