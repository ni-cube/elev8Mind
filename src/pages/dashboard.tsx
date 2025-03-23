import ChatHeader from "@/components/header";
import ChatPrompt from "@/components/prompt";
import React, { useState, useRef, useCallback, useEffect } from "react";
import clsx from 'clsx';
import Layout from "@/layout";
import { Profile } from "@/types/profile";
import { emotionEmojis } from "@/utils/emotions";
import { GameState } from "@/types/gameState";
interface Message {
    id: number;
    text: string;
    sender: string;
    timestamp: string;
}

export default function Dashboard() {
    const [messages, setMessages] = useState<Message[]>([]); // Adjust the type as needed
    const [profile, setProfile] = useState<Profile>({} as Profile);
    const [gameState, setGameState] = useState<GameState>({
        stars: 1,
        level: 1,
        currentIndex: -1,
        streak: 0, // TODO need to pull from previous sessions
    });
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
        setProfile(JSON.parse(localStorage.getItem('profile') || '{}'));
    }, [profile]);

    useEffect(() => {
        const profile = JSON.parse(localStorage.getItem('profile') || '{}'); 
        setMessages((prev) => [
            ...prev,
            {
                id: prev.length + 1,
                text: `Hi ${profile.username}! ${emotionEmojis[profile.emotKey as keyof typeof emotionEmojis].response}`,
                sender: "bot",
                timestamp: new Date().toISOString(),
            },
        ]);
    }, []);
    return (

      <Layout>
        <div className="flex flex-col h-screen bg-primary p-1">
            <div className="max-w-7xl mx-auto w-full flex flex-col flex-1" style={{ height: '100%' }}>
            <ChatHeader stars={gameState.stars} level={gameState.level} profile={profile} messages={messages}/>
        
            <div className="flex-1 bg-lightest rounded-lg p-5 border-1 border-darkest overflow-y-auto mb-5"
                style={{ maxHeight: '100%' }}
                ref={messagesContainerRef}>
                <div className="w-full max-w-100% mx-auto">
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
                                'max-w-[70%] p-3 rounded-lg shadow-lg border-2 border-darkest',
                                message.sender === 'user' ? 'bg-darkest text-white' : 'bg-lighter text-black'
                            )}
                        >
                            {message.text.split('/n').map((line, idx) => (
                                <p key={idx} className="m-0 mb-1">{line}</p>
                                ))}
                        </div>
                    </div>
                    ))}
                </div>    
            </div>
        
            <ChatPrompt messages={messages} setMessages={memoizedSetMessages} setGameState={setGameState}/>
            </div>
        </div>
      </Layout>
    );    
}