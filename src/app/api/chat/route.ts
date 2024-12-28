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

export async function POST(req: NextRequest) {
  const messages = (await req.json())["messages"];
  console.log("Q - " + messages.map((msg: Message) => "(" + msg.sender + ") - " + msg.text).join(";"));
  // Ensure the messages are properly formatted with 'role' and 'content'
  const formattedMessages = messages.map((msg: Message) => {
    return {
      role: (msg.sender=='bot')?'assistant':"user",  // Default to 'user' if role is missing
      content: msg.text || "", // Default to empty string if content is missing
    };
  });
  console.log("Q - " + formattedMessages.map((msg: { role:string, content: string; }) => "(" + msg.role + ") - " + msg.content).join(";"));
  const result = await streamText({
    model: openai("gpt-3.5-turbo"),
    system: systemMessage,
    messages: formattedMessages,
  });

  return result.toAIStreamResponse();
}
