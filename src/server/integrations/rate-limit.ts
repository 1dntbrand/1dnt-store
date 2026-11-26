import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const checkRestockRateLimit = async (
  clientKey: string,
): Promise<boolean> => {
  const redis = Redis.fromEnv();
  const limiter = Ratelimit.slidingWindow(5, "1 m");

  const ratelimit = new Ratelimit({
    redis,
    limiter,
    prefix: "1dnt:restock",
  });

  const { success, reason } = await ratelimit.limit(clientKey);

  if (reason === "timeout") {
    throw new Error("Restock rate limit check timed out");
  }

  return success;
};
