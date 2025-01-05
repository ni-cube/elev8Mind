"use client"
import ChatHeader from "@/components/chat-header";
import ChatPrompt from "@/components/chat-prompt";
import React, { useState, useRef, useCallback, useEffect } from "react";
import clsx from 'clsx';
import { useEmotion } from "@/hooks/useEmotion";
import Layout from "@/layout";

interface Message {
  id: number;
  text: string;
  sender: string;
  timestamp: string;
}
export default function Dashboard() {
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

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight; // Scroll to bottom
  }, [messages]);

  
  useEffect(() => {
    setMessages(() => [
      {
        id: 1,
        text: `Hi ${localStorage.getItem('username')}! ${getCurrentEmoji().response}`,
        sender: "bot",
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

    return (
      
      <Layout>
        <div className="flex flex-col h-screen bg-primary p-2">
            <div className="max-w-4xl mx-auto w-full flex flex-col flex-1">
            <ChatHeader stars={0} level={0} />
        
            <div className="flex-1 bg-lightest rounded-lg p-5 overflow-y-auto mb-5 shadow-md"
                style={{ maxHeight: '100%' }}
                ref={messagesContainerRef}>
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
                            'max-w-[70%] p-3 rounded-lg shadow-lg',
                            message.sender === 'user' ? 'bg-darkest text-white' : 'bg-lighter text-text'
                        )}
                    >
                        {message.text}
                    </div>
                </div>
                ))}
            </div>
        
            <ChatPrompt messages={messages} setMessages={memoizedSetMessages} />
            </div>
        </div>
      </Layout>
       
    );    
}