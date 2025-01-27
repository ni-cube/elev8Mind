import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export async function readChatResponse(reader: ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>> | undefined) {
    const decoder = new TextDecoder("utf-8");
    let done = false;
    let chatText = "";
    while (!done) {
      const { value, done: readerDone } = await reader!.read();
      done = readerDone;
      if (value != undefined && value.length > 0) {
        let decodedText = decoder.decode(value, { stream: !done });
        //console.log("Decoded Text - " + decodedText);
        if (decodedText.startsWith("0:")) {
            decodedText = decodedText.replace(/"\ne:{.*/g, "");
            decodedText = decodedText.replace(/\nd:{.*/g, "");
            chatText += decodedText.replace(/0:"|"\n/g, "");
        }
      }
    }
    chatText = chatText.replace(/\\/g, "");
    //chatText = chatText.replace(/e:{*/g, "");
    //chatText = chatText.replace(/d:{*/g, "");
    //chatText = chatText.replace(/.nn/g, ". ");
    return chatText;
  }

  export function cn(...inputs: (string | undefined)[]) {
    return twMerge(clsx(inputs));
  }