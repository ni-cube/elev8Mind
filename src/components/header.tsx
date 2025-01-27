import React, { useState } from "react";
import { useRouter } from 'next/navigation'; // Use Next.js router
import {
    Star,
    Trophy,
  } from "lucide-react";
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
    const router = useRouter();

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
    const handleExplorer = async () => {
        window.location.href = '/explorer';
    };


    return (
        <>
        <div className="flex justify-between items-center mb-2">
            <h1 className="text-darkest text-4xl font-bold m-0" onClick={ ()=> router.push('/')}>Elev8 Mind  <span style={{ animation: 'pumpHeart 1s infinite' }}>💙</span></h1>
            {gameState.level!=0 && (
            <div className="flex items-center space-x-4">
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
            <div>
            {gameState.level==0 && (
                <button
                    onClick={handleExplorer}
                    className="px-4 py-1 rounded-lg border-1 cursor-pointer ml-2 bg-lighter text-darkest shadow-lg"
                >
                    📊 Mood Meter
                </button>
            )}
            {gameState.level!=0 && (
                <button
                    onClick={() => router.replace('/dashboard')}
                    className="px-4 py-1 rounded-lg border-1 cursor-pointer ml-2 bg-lighter text-darkest shadow-lg"
                >
                    📊 Quest
                </button>
            )}

                <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="px-4 py-1 rounded-lg border-1 cursor-pointer ml-2 bg-lighter text-darkest shadow-lg"
                >
                    ℹ️
                </button>
                <button
                    onClick={handleExit}
                    className="px-4 py-1 rounded-lg border-1 cursor-pointer ml-2 bg-lighter text-darkest shadow-lg"
                >
                   🚪➡️ 
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
