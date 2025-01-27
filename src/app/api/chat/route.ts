import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextRequest } from "next/server";
import { systemMessage, finalSystemMessage } from "./_constants";
import { llm } from "../_constants";

export async function POST(req: NextRequest) {
  const body = await req.json(); // Parse the JSON once

  const messages = body["messages"];
  const severity = body["severity"];
  const keywords = body["keywords"];
  // We need the old keywords to create the sympathetic response to the user answer
  const oldKeywords = body["old_keywords"];
  let combinedMessages;
  const formattedMessages = messages.map((msg: { sender: string; text: string; }) => {
    return {
      role: (msg.sender=='bot')?'assistant':"user",  // Default to 'user' if role is missing
      content: msg.text || "", // Default to empty string if content is missing
    };
  });
  if(keywords.length==0) { // end of conversation
    combinedMessages = [finalSystemMessage, ...formattedMessages];
  } else {
    const systemMsg: { role: 'system'; content: string }  = { 
      role: "system", content : systemMessage
            .replaceAll("{{keywords}}", keywords.join(", "))
            .replaceAll("{{answer}}", messages.slice(-1)[0].text)
            .replaceAll("{{old_keywords}}", oldKeywords.join(", "))
            .replaceAll("{{severity}}", severity)};
    combinedMessages = [systemMsg, ...formattedMessages.slice(-2)];
  }

  console.log("Q: " + combinedMessages.map((msg: { role:string, content: string; }) => `(${msg.role}) - ${msg.content}`).join(";"));
  const result = await streamText({
    model: openai(llm),
    messages: combinedMessages,
  });
  return result.toDataStreamResponse();

}