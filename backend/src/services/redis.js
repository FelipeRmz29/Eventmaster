let redisClient = null;

if (process.env.REDIS_URL) {
  const redis = require("redis");

  redisClient = redis.createClient({
    url: process.env.REDIS_URL,
  });

  redisClient.on("error", (error) => {
    console.error("Redis error:", error.message);
  });

  redisClient.connect().catch((error) => {
    console.error("No se pudo conectar a Redis:", error.message);
  });
}

module.exports = redisClient;
