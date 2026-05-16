const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

redisClient.connect();

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

module.exports = redisClient;