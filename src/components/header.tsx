import React, { useState } from "react";
import { usePathname } from 'next/navigation';
import {
    Star,
    Trophy,
  } from "lucide-react";
import Image from "next/image";
interface Profile {
    username: string;
    grade: string;  
    gender: string;
}
interface Message {
    id: number;
    text: string;
    sender: string;
    timestamp: string;
}
interface GameProps {
    stars: number;
    level: number;
    profile: Profile;
    messages: Message[],
}

export default function ChatHeader(gameState: GameProps) {
    const [showInfo, setShowInfo] = useState(false);
    const pathname = usePathname();
    const buttonText = pathname?.includes('explorer') ? ' Quest' : ' Mood Explorer';

    const handleExit = async () => {
        try {
            // Submit profile data to a backend or endpoint (e.g., /api/submit-profile)
            const response = await fetch('/api/exit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({'profile': gameState.profile, 'messages': gameState.messages}), // Send the profile data
            });
            if (!response.ok) {
                console.error('Failed to submit profile');
            }
        } catch (error) {
            console.error('Error submitting profile:', error);
        } finally {
            window.location.href = '/login';
        }
    };
    const handleLogin = async () => {
        window.location.href = '/login';
    };
    const handleExplorer = async () => {
        if(location.pathname == '/explorer') {
            window.location.href = '/dashboard';
        } else {  
            window.location.href = '/explorer';
        }
    };


    return (
        <>
        
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2" onClick={handleLogin}>
                <Image 
                    src="/logo.png" 
                    alt="Elev8Mind Logo" 
                    width={200} 
                    height={50} 
                    className="w-auto h-10 md:h-12 max-w-full object-contain"
                />
            </div>
            {gameState.level!=0 && (
            <div className="hidden md:flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                    <Trophy className="w-6 h-6 fill-yellow-500" />
                    <span className="font-bold text-darkest">Level {gameState.level} / 11</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 fill-yellow-400" />
                    <span className="font-bold text-darkest">{gameState.stars}</span>
                </div>
            </div>
            )}
            <div className="flex items-center space-x-2">
                <button
                    onClick={handleExplorer}
                    className="px-2 py-1 rounded-lg border-2 font-bold cursor-pointer ml-1 bg-lighter text-darkest border-darkest shadow-lg"
                >
                    <span>📊</span> 
                    <span className="hidden md:inline">{buttonText}</span>
                </button>

                <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="px-2 py-1 rounded-lg border-2 border-darkest cursor-pointer ml-1 bg-lighter text-darkest shadow-lg"
                >
                    ℹ️
                </button>
                <button
                    onClick={handleExit}
                    className="px-2 py-1 rounded-lg border-2 border-darkest cursor-pointer ml-1 bg-lighter text-darkest shadow-lg"
                >
                   ➡️ 
                </button>
            </div>
        </div>

        {showInfo && (
            <div className="p-4 bg-lightest rounded-lg mb-5">
                <h3 className="m-0 mb-2 text-darkest">About Elev8 Mind 💙</h3>
                <p className="m-0 text-text">
                    Elev8 Mind analyzes conversation patterns to help identify early
                    signs of depression. This is a prototype - for mental health
                    concerns, please reach out to a mental health professional. 🏥
                </p>
            </div>
        )}
        </>
    ); 
}
