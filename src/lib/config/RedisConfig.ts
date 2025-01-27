import Redis from "ioredis";

class RedisConfig {
  private redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1", // Default to localhost
      port: parseInt(process.env.REDIS_PORT || "6379", 10), // Default to 6379
      password: process.env.REDIS_PASSWORD || undefined, // Password is optional
    });
  }

  /**
   * Appends new strings to an existing array stored at the Redis key.
   * If the key does not exist, initializes it with the provided array.
   * @param key Redis key
   * @param newValues Array of strings to append
   */
  async appendArray(key: string, value: string) {
    await this.redisClient.eval(
      `
      local currentValue = redis.call('GET', KEYS[1])
      if currentValue then
        local parsedValue = cjson.decode(currentValue)
        for _, v in ipairs(ARGV) do
          table.insert(parsedValue, v)
        end
        redis.call('SET', KEYS[1], cjson.encode(parsedValue))
      else
        redis.call('SET', KEYS[1], cjson.encode(ARGV))
      end
      return redis.call('GET', KEYS[1])
      `,
      1, // Number of keys
      key,
      value
    ) as string;
  }

  /**
   * Retrieves the value for a given Redis key as a string array.
   * @param key Redis key
   */
  async getArray(key: string): Promise<string[]> {
    const value = await this.redisClient.get(key);
    return value ? JSON.parse(value) : [];
  }

  async set(key: string, value: string) {
    await this.redisClient.set(key, value);
  }

  /**
   * Closes the Redis connection.
   */
  async close() {
    await this.redisClient.quit();
  }

  generateKey(id: string, grade: string, sex: string, prefix = "users") {
    return `${prefix}:${grade}:${sex}:${id}`;
  }
}

export default RedisConfig;
