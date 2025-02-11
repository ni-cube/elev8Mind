import { NextResponse } from 'next/server';
const decoder = new TextDecoder("utf-8");

export async function fetchAndStreamResponse(combinedMessages: { role: string; content: string; }[]) {
  const response = await fetch('https://elev8-ml-pi.vercel.app/api/mistral', {
    method: 'POST',
    body: JSON.stringify({messages: combinedMessages}),
    headers: { "Content-Type": "application/json" },
  });
  if (!response.body) {
    throw new Error("Response body is null");
  }

  const responseClone = response.clone();

  // Convert response body into a stream
  const stream = new ReadableStream({
    async start(controller) {
      const reader = responseClone.body!.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value != undefined && value.length > 0) {
          let decodedText = decoder.decode(value, { stream: !done });
          if (decodedText.startsWith("0:")) {
            decodedText = decodedText.replace(/"\ne:{.*/g, "");
            decodedText = decodedText.replace(/\nd:{.*/g, "");
            decodedText = decodedText.replace(/0:"|"\n/g, "");
            controller.enqueue(decodedText);
          }
        }
      }
      controller.close();
    },
  });
  return new NextResponse(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export async function fetchAndTextResponse(combinedMessages: { role: string; content: string; }[]) {
  const response = await fetch('https://elev8-ml-pi.vercel.app/api/mistral', {
    method: 'POST',
    body: JSON.stringify({messages: combinedMessages}),
    headers: { "Content-Type": "application/json" },
  });
  if (!response.body) {
    throw new Error("Response body is null");
  }

  const reader = response.body!.getReader();
  let chatText = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value != undefined && value.length > 0) {
      let decodedText = decoder.decode(value, { stream: !done });
      if (decodedText.startsWith("0:")) {
        decodedText = decodedText.replace(/"\ne:{.*/g, "");
        decodedText = decodedText.replace(/\nd:{.*/g, "");
        decodedText = decodedText.replace(/0:"|"\n/g, "");
        chatText += decodedText;
      }
    }
  }
  chatText = chatText.replace(/\\/g, "");
  return chatText;
}