import React, { useState, useRef, useEffect } from "react";
import { getCategoryOf2ndLastSymptomsCovered, getSymptomfromEmotionId, getKeywords } from "@/lib/cema";
import { helpMessage } from "../utils/genericMessage";
import { readChatResponse } from "@/utils/util";
import { emotionEmojis, commonEmojis } from "@/utils/emotions";
import { GameState } from "@/types/gameState";

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
export default function ChatPrompt({ messages, setMessages, setGameState }: { messages: Message[], setMessages: React.Dispatch<React.SetStateAction<Message[]>>, setGameState: React.Dispatch<React.SetStateAction<GameState>> }) {
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

    if(chatState.symptomsCovered.length%2==0) {
        setGameState((prev) => ({
            ...prev,
            level: Math.min(prev.level + 1, 11),
        }));
    }
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
          symptomSelected.symptomCovered = "Suicidal_H";
        } else if(chatText.toLowerCase().indexOf("help is available")!=-1 ||
          chatText.toLowerCase().indexOf("crisis helpline")!=-1 ||
          chatText.toLowerCase().indexOf("resources available to help")!=-1) {  
          chatText += ("\n\n" + helpMessage);
          symptomSelected.symptomCovered = "Suicidal_H";      
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
              className="flex-1 p-1 rounded-lg border-1 border-darkest bg-lightest outline-none text-text"
              placeholder={generatingText? "Processing...":"Type your message... 💭"}
            />
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 bg-lighter border-2 border-darkest rounded-lg cursor-pointer"
            >
              {emoji}
            </button>
            <button
              type="submit"
              className="p-2 bg-darkest text-white sm:text-sm rounded-lg font-bold cursor-pointer"
            >
              Send 💙
            </button>
            <button
              type="button"
              onClick={() => setIsMute(!isMute)}
              className="p-2 bg-lighter border-2 border-darkest rounded-lg cursor-pointer text-xl"
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
                    className="text-xl p-2 border-2 border-darkest bg-transparent cursor-pointer rounded-sm"
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
