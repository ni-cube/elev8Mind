import React, { useState, useRef, useEffect } from "react";
import { getCategoryOf2ndLastSymptomsCovered, getSymptomfromEmotionId, getKeywords } from "@/lib/cema";
import { helpMessage } from "../utils/genericMessage";
import { readChatResponse } from "@/utils/util";
import { emotionEmojis, commonEmojis } from "@/utils/emotions";

interface Message {
  id: number;
  text: string;
  sender: string;
  timestamp: string;
}
interface ChatState {
  symptomsCovered: string[],
  currentSymptomId: string
}
interface SymptomSelection {
  symptomCovered:string, 
  keywords: string[],
}
export default function ChatPrompt({ messages, setMessages }: { messages: Message[], setMessages: React.Dispatch<React.SetStateAction<Message[]>> }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [ emoji, setEmoji ] = useState("");
  const [isMute, setIsMute] = useState(true);
  const [inputText, setInputText] = useState("");
  const [generatingText, setGeneratingText] = useState<boolean>(false);

  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem('profile') || '{}');
    const symptomId = getSymptomfromEmotionId(profile.emotKey).id;
    setChatState({
      symptomsCovered: [symptomId + "_L"],
      currentSymptomId: symptomId
    });
    setEmoji(emotionEmojis[profile.emotKey as keyof typeof emotionEmojis].emoji);
  }, []);

  const [chatState, setChatState] = useState<ChatState>({
    symptomsCovered: ["Angry" + "_L"],
    currentSymptomId: "Angry",
  });
  //const [symptomsCovered, setSymptomsCovered] = useState<string[]>([]);



  const handleEmojiClick = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const fetchSeverity = async (data: Message[]) => {
    try {
      const response = await fetch("https://elev8-ml-pi.vercel.app/api/bayes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch severity");
      }
  
      const result = await response.json();
      return result.severity; // Return the severity for further use if needed
    } catch (error) {
      console.error("Error:", error);
      throw error; // Rethrow the error to handle it outside this function if necessary
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
      console.log("Ni3 Input - " + JSON.stringify(chatState));
      const symptomSelected:SymptomSelection = getKeywords(chatState.currentSymptomId, chatState.symptomsCovered);
      
      console.log("Ni3 Output - " + JSON.stringify(symptomSelected));  
      let chatText = "";
      if(symptomSelected.symptomCovered==='Suicidal_H') {
        chatText = "Help is available.";
      } else {
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
            "keywords": (symptomSelected!=null)?symptomSelected.keywords: [],
            "old_keywords": getCategoryOf2ndLastSymptomsCovered(chatState.symptomsCovered),
            "severity": fetchSeverity(messages),
          }),
        });
        // If the response is a stream, handle the stream (Real-time update)
        const reader = response.body?.getReader();
        chatText = await readChatResponse(reader);  
      }
      (async () => {
        if(chatText.startsWith("Help is available.")) {
          chatText = helpMessage;
        } else if(chatText.indexOf("crisis helpline")!=-1) {  
          chatText += ("\n" + helpMessage);          
        } else if(chatText.indexOf("Thank you. I'm here to help whenever you need me.")!=-1) {
          chatText = "Thank you. I'm here to help whenever you need me. 💙";
        }
        if(symptomSelected!=null) {
          setChatState(prev => ({
            ...prev,
            symptomsCovered: [...prev.symptomsCovered, symptomSelected.symptomCovered],
            currentSymptomId: symptomSelected.symptomCovered.replace("_H", "").replace("_L", ""),
          }));
        }

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
