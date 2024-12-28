"use client"
import ChatHeader from "@/components/chat-header";
import ChatPrompt from "@/components/chat-prompt";
import React, { useState, useRef, useCallback, useEffect } from "react";
import clsx from 'clsx';
import { useEmotion } from "@/hooks/useEmotion";

interface Message {
  id: number;
  text: string;
  sender: string;
  timestamp: string;
}
export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]); // Adjust the type as needed

  const { getCurrentEmoji } = useEmotion();
  
  useEffect(() => {
    setMessages([
      {
        id: 1,
        text: `Hi ${localStorage.getItem('username')}! I'm VibeSpace 💙. How are you feeling today?`,
        sender: "bot",
        timestamp: new Date().toISOString(),
      },
    ]);  
  }, []);

  
  // Memoize the setMessages function using useCallback, passing it directly to the child component
  const memoizedSetMessages = useCallback<React.Dispatch<React.SetStateAction<Message[]>>>(
    (newMessages) => {
      setMessages(newMessages); // This is the only place where setMessages is used
    },
    [] // Empty dependency array means the function is memoized and stable across re-renders
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Scroll to the bottom of the chat when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]); // This effect runs every time messages change

  
  useEffect(() => {
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        text: `${getCurrentEmoji().emoji} I'm feeling ${getCurrentEmoji().mood}`,
        sender: "user",
        timestamp: new Date().toISOString(),
      },
      {
        id: prev.length + 2,
        text: getCurrentEmoji().response,
        sender: "bot",
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

    return (
      
      <div className="flex flex-col h-screen bg-primary p-5">
        <div className="max-w-4xl mx-auto w-full flex flex-col flex-1">
          <ChatHeader messages={messages} />
    
          <div className="flex-1 bg-lightest rounded-lg p-5 overflow-y-auto mb-5 shadow-md">
            {messages.map((message) => (
              <div
                key={message.id}
                className={clsx(
                  'flex mb-2',
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={clsx(
                    'max-w-[70%] p-3 rounded-lg',
                    message.sender === 'user' ? 'bg-darkest text-white' : 'bg-lighter text-text'
                  )}
                >
                  {message.text}
                </div>
              </div>
            ))}
    
            <div ref={messagesEndRef} />
          </div>
    
          <ChatPrompt messages={messages} setMessages={memoizedSetMessages} />
        </div>
      </div>
    );    
}