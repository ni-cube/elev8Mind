import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { schoolMessage, userMessage } from "./_constants";
import { userSessions } from '@/data/store';
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json(); // Parse the JSON once
  let systemMsg: { role: 'system'; content: string };

  if(!body["name"]) {
    const phqScore = body["phqScore"];
    const bdiScore = body["bdiScore"];
    systemMsg  = { 
      role: "system", content : schoolMessage
            .replaceAll("{{phqScores}}", phqScore.toString())
            .replaceAll("{{bdiScores}}", bdiScore.toString())
    };
  } else {
    const name = body["name"];
    const sessions = userSessions.filter((session) => (session.user.split(':')[1] === name));
    const averages = sessions.reduce(
      (acc, session) => {
        const { phq9_score, bdi_score } = session.scores;
        acc.totalPHQ += parseInt(phq9_score, 10);
        acc.totalBDI += parseInt(bdi_score, 10);
        acc.count += 1;
        return acc;
      },
      { totalPHQ: 0, totalBDI: 0, count: 0 }
    );

    const messages = sessions.map((session) => session.scores.message).join(" | ");
    const averagePHQScore = (averages.totalPHQ / averages.count || 0).toFixed(2);
    const averageBDIScore = (averages.totalBDI / averages.count || 0).toFixed(2);

    systemMsg  = { 
      role: "system", content : userMessage
            .replaceAll("{{phqScores}}", averagePHQScore)
            .replaceAll("{{bdiScores}}", averageBDIScore)
            .replaceAll("{{messages}}", messages)
    };
  }
  const result = await streamText({
    model: openai("gpt-3.5-turbo"),
    messages: [systemMsg],
  });
  return result.toDataStreamResponse();

}