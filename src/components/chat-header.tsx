"use client"
import React, { useState } from "react";
import { useRouter } from 'next/navigation'; // Use Next.js router
import {
    Star,
    Trophy,
  } from "lucide-react";
interface GameProps {
    stars: number;
    level: number;
}
export default function ChatHeader(gameState: GameProps) {
    const [showInfo, setShowInfo] = useState(false);
    const router = useRouter();
    return (
        <>
        <div className="flex justify-between items-center mb-2">
            <h1 className="text-darkest text-4xl font-bold m-0" onClick={ ()=> router.push('/')}>VibeSpace  <span style={{ animation: 'pumpHeart 1s infinite' }}>💙</span></h1>
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
                    onClick={() => router.push('/explorer')}
                    className="px-4 py-1 rounded-lg border-1 cursor-pointer ml-2 bg-lighter text-darkest shadow-lg"
                >
                    📊 Mood Meter
                </button>
            )}
            {gameState.level!=0 && (
                <button
                    onClick={() => router.push('/')}
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
                    onClick={() => router.push('/login')}
                    className="px-4 py-1 rounded-lg border-1 cursor-pointer ml-2 bg-lighter text-darkest shadow-lg"
                >
                   🚪➡️ 
                </button>
            </div>
        </div>

        {showInfo && (
            <div className="p-4 bg-lightest rounded-lg mb-5">
                <h3 className="m-0 mb-2 text-darkest">About VibeSpace 💙</h3>
                <p className="m-0 text-text">
                    VibeSpace analyzes conversation patterns to help identify early
                    signs of depression. This is a prototype - for mental health
                    concerns, please reach out to a mental health professional. 🏥
                </p>
            </div>
        )}
        </>
    ); 
}
