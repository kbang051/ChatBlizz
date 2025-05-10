import Redis from "ioredis";

const redisConfig = {
  host: "localhost",
  port: 6379,
};

const redis = new Redis(redisConfig);
const pub = new Redis(redisConfig);
const sub = new Redis(redisConfig);

redis.on("connect", () => console.log("Connected to Redis"));
redis.on("error", (error) => console.log("Redis error: ", error));

export { redis, pub, sub };
