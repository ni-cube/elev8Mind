"use client"
import React, { useState, useEffect, useRef } from "react";
import { useEmotion } from "@/hooks/useEmotion";
interface Message {
    id: number;
    text: string;
    sender: string;
    timestamp: string;
}
  
 
export default function ChatHeader({ messages }: { messages: Message[] }) {
    const [showInfo, setShowInfo] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const { getAllEmotions, setEmotionData } = useEmotion();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Keep existing useEffect, emotionEmojis, and other utility functions
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        updateAnalytics();
    }, [messages]);

    const detectEmotions = (text: string) => {
        const emotionKeywords = {
        joy: [
            "happy",
            "excited",
            "glad",
            "wonderful",
            "great",
            "good",
            "positive",
            "amazing",
            "😊",
            "😃",
            "😄",
            "🙂",
            "😁",
            "🌟",
            "❤️",
            "💕",
            "✨",
            "👍",
        ],
        sadness: [
            "sad",
            "down",
            "depressed",
            "unhappy",
            "miserable",
            "awful",
            "crying",
            "😢",
            "😭",
            "😥",
            "☹️",
            "😔",
        ],
        anxiety: [
            "worried",
            "nervous",
            "anxious",
            "stressed",
            "tense",
            "scared",
            "afraid",
            "😰",
            "😨",
            "😱",
            "😟",
            "😦",
        ],
        anger: [
            "angry",
            "frustrated",
            "annoyed",
            "mad",
            "irritated",
            "upset",
            "😠",
            "😡",
            "💢",
            "😤",
        ],
        fatigue: [
            "tired",
            "exhausted",
            "drained",
            "sleepy",
            "weak",
            "weary",
            "😫",
            "😪",
            "🥱",
            "😮‍💨",
        ],
        };

        const words = text.toLowerCase().split(/\s+/);
        const emotions: { [key: string]: number } = {
            joy: 0,
            sadness: 0,
            anxiety: 0,
            anger: 0,
            fatigue: 0,
        };

        Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
            emotions[emotion] = words.filter((word) =>
                keywords.includes(word)
            ).length;
        });

        return {
            joy: emotions.joy || 0,
            sadness: emotions.sadness || 0,
            anxiety: emotions.anxiety || 0,
            anger: emotions.anger || 0,
            fatigue: emotions.fatigue || 0,
        };
    };

    const updateAnalytics = () => {
        const userMessages = messages.filter((m) => m.sender === "user");
        if (userMessages.length === 0) return;
        const combinedText = userMessages.map((m) => m.text).join(" ");
        const emotions = detectEmotions(combinedText);
        setEmotionData(emotions);
    };

    return (
        <>
        <div className="flex justify-between items-center mb-1">
            <h1 className="text-darkest text-4xl font-bold m-0">VibeSpace  <span style={{ animation: 'pumpHeart 1s infinite' }}>💙</span></h1>
            <div>
                <button
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className="px-4 py-2 rounded-lg border-none cursor-pointer ml-2 bg-lighter text-darkest"
                >
                    📊 Analytics
                </button>
                <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="px-4 py-2 rounded-lg border-none cursor-pointer ml-2 bg-lighter text-darkest"
                >
                    ℹ️ Info
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

        {showAnalytics && (
            <div className="p-4 bg-lightest rounded-lg mb-5">
                <h3 className="m-0 mb-4 text-darkest">Emotion Analysis 🎭</h3>
                <div className="flex justify-between">
                        <div className="text-center">
                            {getAllEmotions().map(({ emotion, emoji }) => (
                                <>
                                <div className="text-2xl text-darkest">
                                    {emoji.emoji}
                                </div>
                                <div className="capitalize text-text">
                                    {emotion}
                                </div>
                                </>
                            ))};
                        </div>
                </div>
            </div>

        )}
        </>
    ); 
}
