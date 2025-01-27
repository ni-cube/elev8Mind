import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json(); // Parse the JSON once

  const messages = body["messages"];
  console.log("Emotional Severty calculated from the user input - " + JSON.stringify(messages));
  //TODO call to the ML app to get the severity
  const severity = 2;

  // Return a JSON response
  return NextResponse.json({ severity });
}