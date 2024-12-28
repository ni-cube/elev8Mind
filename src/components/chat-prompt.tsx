"use client"
import React, { useState, useRef, useEffect } from "react";
import { useEmotion } from "@/hooks/useEmotion";
const commonEmojis = [
  "😊",
  "😃",
  "😄",
  "🙂",
  "😁",
  "😢",
  "😭",
  "😥",
  "☹️",
  "😔",
  "😰",
  "😨",
  "😱",
  "😟",
  "😦",
  "😠",
  "😡",
  "💢",
  "😤",
  "😣",
  "😫",
  "😪",
  "🥱",
  "😮‍💨",
  "🌟",
  "❤️",
  "💕",
  "✨",
  "👍",
  "🙏",
];
interface Message {
  id: number;
  text: string;
  sender: string;
  timestamp: string;
}
export default function ChatPrompt({ messages, setMessages }: { messages: Message[], setMessages: React.Dispatch<React.SetStateAction<Message[]>> }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [ emoji, setEmoji ] = useState("");
  const [isMute, setIsMute] = useState(false);
  const [inputText, setInputText] = useState("");
  const [generatingText, setGeneratingText] = useState<boolean>(false);
  const { getCurrentEmoji } = useEmotion();

  const handleEmojiClick = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setEmoji(getCurrentEmoji().emoji);
  });

  const fetchVoice = async (text: string) => {
    try {
      const response = await fetch("/api/voice", {
        method: "POST",
        body: JSON.stringify({
          text: text,
        }),
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
      } else {
        const audio = new Audio(url);
        audio.play();
        audioRef.current = audio;
      }
      audioRef.current?.addEventListener("ended", () => {
        URL.revokeObjectURL(url);
        setGeneratingText(false);
      });
    } catch (error) {
      console.error("Failed to fetch voice:", error);
      return false;
    } finally {
      return true;
    }
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      sender: "user",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev: Message[]) => [...prev, userMessage]);
    setInputText("");
    
    try {
      setGeneratingText(true);
      // Send the message to the backend API using Fetch (for streaming)
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...messages, //.filter((msg: Message) => msg.sender === "user"),
            userMessage,
          ],
        }),
      });
      // If the response is a stream, handle the stream (Real-time update)
      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let chatText = "";
      while (!done ) {
        const { value, done: readerDone } = await reader!.read();
        done = readerDone;
        if (value != undefined && value.length > 0) {
          const decodedText = decoder.decode(value, { stream: !done });
          //decodedText = decodedText.replace(/0:"|e:.*?}|d:.*?}|}|"/g, "");
          //decodedText = decodedText.replace(/,isContinued:false/g, "");
          //decodedText = decodedText.replace(/\s+([.,!?])/, "$1");
          // Step 2: Replace multiple spaces with a single space and trim extra spaces
          //decodedText = decodedText.replace(/\s+/g, " ");
          //console.log(decodedText);
          //
          chatText += decodedText.replace(/0:/g, "").replace(/\s+/g, " ").trim();
        }
      }  
  
      (async () => {
        // Step 1: Remove "0:" and similar prefixes, along with unwanted metadata
        const cleanedString = chatText.replace(/0:"|e:.*?}|d:.*?}|}|"/g, "");
        chatText = cleanedString.replace(/,isContinued:false/g, "");
        chatText = chatText.replace(/\s+([.,!?])/, "$1");
        chatText = chatText.replace(/\s+/g, " ").trim();

        chatText = chatText.replace(/\n/g, "<br/>");
        const botResponse = {
          id: messages.length + 1,
          text: chatText,
          sender: "bot",
          timestamp: new Date().toISOString(),
        };
        if(!isMute) {
          if(await fetchVoice(chatText)) {
            setMessages((prev: Message[]) => [...prev, botResponse]);
          }
        } else {  
          setMessages((prev: Message[]) => [...prev, botResponse]);
          setGeneratingText(false);
        }
      })();
    } catch (error) {
      console.error("Error sending message to API:", error);
    } 
  };  

  return (
    <>
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 relative"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 p-3 rounded-lg border border-lighter bg-lightest outline-none text-text"
              placeholder={generatingText? "Processing...":"Type your message... 💭"}
            />
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-3 bg-lighter border-none rounded-lg cursor-pointer text-xl"
            >
              {emoji}
            </button>
            <button
              type="submit"
              className="p-3 px-6 bg-darkest text-white border-none rounded-lg cursor-pointer"
            >
              Send 💙
            </button>
            <button
              type="button"
              onClick={() => setIsMute(!isMute)}
              className="p-3 bg-lighter border-none rounded-lg cursor-pointer text-xl"
            >
              {isMute ? "🔇" : "🔊"}
            </button>

            {showEmojiPicker && (
              <div
                className="absolute bottom-full right-20 mb-2 bg-lightest rounded-lg shadow-lg p-3 grid grid-cols-6 gap-2 z-50"
              >
                {commonEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-xl p-2 border-none bg-transparent cursor-pointer rounded-sm"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

          </form>

    </>
  );
}