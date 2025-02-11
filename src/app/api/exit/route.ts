import { NextRequest, NextResponse } from "next/server";
import { systemMessage } from "./_constants";
import FileConfig from "@/lib/config/FileConfig";
import { Profile } from "@/types/profile";
import { fetchAndTextResponse } from "../util";

export async function POST(req: NextRequest) {
  const body = await req.json(); // Parse the JSON once
  const profile = body["profile"] as Profile;
  const messages = body["messages"];
  const userMsg:string = messages.map((msg: { id:number, text: string, sender: string, timestamp:string  }) => msg.text).join(" | ");
  //console.log("CC - " + userMsg);
  const store = new FileConfig(); // Create a new instance of RedisConfig
  const scoreKey = `scores:${profile.username}:${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`;

  const systemMsg: { role: 'system'; content: string }  = { 
    role: "system", content : systemMessage
          .replaceAll("{{response}}", userMsg)
        };

  const parsedText = await fetchAndTextResponse([systemMsg]);

  const parsedResponse = JSON.parse(parsedText);
  parsedResponse.message = userMsg;
  parsedResponse.gender = profile.gender;
  parsedResponse.grade = profile.grade;
  
  // Format - "{\"phq9_score\":\"15\",\"bdi_score\":\"24\",\"message\":\"I am sad\"}"
  store.set(scoreKey, JSON.stringify(parsedResponse));
  //console.log("DD - " + JSON.stringify(parsedResponse));
  return NextResponse.json({ "status": "success" });
}