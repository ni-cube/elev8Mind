import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
const decoder = new TextDecoder("utf-8");
export async function readChatResponse(reader: ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>> | undefined) {
    
    let done = false;
    let chatText = "";
    while (!done) {
      const { value, done: readerDone } = await reader!.read();
      done = readerDone;
      if (value != undefined && value.length > 0) {
        const decodedText = decoder.decode(value, { stream: !done });
        // //console.log("Decoded Text - " + decodedText);
        // if (decodedText.startsWith("0:")) {
        //     decodedText = decodedText.replace(/"\ne:{.*/g, "");
        //     decodedText = decodedText.replace(/\nd:{.*/g, "");
        //     chatText += decodedText.replace(/0:"|"\n/g, "");
        // }
        chatText += decodedText;
      }
    }
    chatText = chatText.replace(/\\/g, "");
    //chatText = chatText.replace(/e:{*/g, "");
    //chatText = chatText.replace(/d:{*/g, "");
    chatText = chatText.replaceAll(".nn", ". ");
    return chatText;
  }

  export function cn(...inputs: (string | undefined)[]) {
    return twMerge(clsx(inputs));
  }