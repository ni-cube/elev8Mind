import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextRequest } from "next/server";
import { systemMessage } from "./_constants";


// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export const runtime = "edge";

interface Message {
    id: number;
    text: string;
    sender: string;
    timestamp: string;
}
/*
const chatPrompts = [
  {
    id: "Sad",
    text: "Level 1: Mood Quest! How's your vibe today? 🌈",
    options: [
      {
        text: "Feeling awesome! 🌟",
        value: 0,
        stars: 10,
        achievement: "Mood Master",
        insight: "Positive mood state",
      },
      {
        text: "A bit down sometimes 🌥️",
        value: 1,
        stars: 8,
        achievement: "Mood Tracker",
        insight: "Mild mood fluctuation",
      },
    ]
  },
];
*/

export async function POST(req: NextRequest) {
    const messages = (await req.json())["messages"];
    //const mood = (await req.json())["mood"];
    console.log("Q - " + messages.map((msg: Message) => `(${msg.sender}) - ${msg.text}`).join(";"));
    // Ensure the messages are properly formatted with 'role' and 'content'
    const formattedMessages = messages.map((msg: Message) => {
      return {
        role: (msg.sender=='bot')?'assistant':"user",  // Default to 'user' if role is missing
        content: msg.text || "", // Default to empty string if content is missing
      };
    });
    console.log("Q - " + formattedMessages.map((msg: { role:string, content: string; }) => `(${msg.role}) - ${msg.content}`).join(";"));
    const result = await streamText({
      model: openai("gpt-3.5-turbo"),
      system: systemMessage,
      messages: formattedMessages,
    });

    return result.toAIStreamResponse();
}
