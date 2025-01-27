import RedisConfig from "@/lib/config/RedisConfig"; // Import RedisConfig
import { userSessions } from "../../../../data/store";

export async function GET() {
  const redis = new RedisConfig(); // Create a new instance of RedisConfig

  userSessions.forEach((elem: { user: string; scores: { phq9_score: string; bdi_score: string; message: string; }; }) => {
    return redis.set(elem.user, JSON.stringify(elem.scores));
  });
  return new Response("User sessions added to Redis", { status: 200 });

}
