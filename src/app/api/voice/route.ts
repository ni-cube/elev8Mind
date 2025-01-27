import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const text: string = (await req.json())["text"];
  console.log("A - " + text);
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": process.env.ELEVENLABS_API_KEY!,
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_turbo_v2_5",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5,
        use_speaker_boost: true,
      },
    }),
  };

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/GzE4TcXfh9rYCU9gVgPp/stream`,
    options
  );

  return new NextResponse((await response.blob()).stream(), {
    headers: {
      "Content-Type": "audio/mpeg",
    },
  });
}
