"use client"
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@radix-ui/themes";
import Layout from "@/layout";
import clsx from "clsx";
import ChatHeader from "@/components/header";
import { GameState } from "@/types/gameState";

const questions = [
  {
    id: "mood",
    text: "Level 1: Mood Quest! How's your vibe today? 🌈",
    options: [
      {
        text: "Feeling awesome! 🌟",
        value: 0,
        stars: 10,
        achievement: "Mood Master",
        insight: "Positive mood state",
      },
      {
        text: "A bit down sometimes 🌥️",
        value: 1,
        stars: 8,
        achievement: "Mood Tracker",
        insight: "Mild mood fluctuation",
      },
      {
        text: "The clouds won't lift ☁️",
        value: 2,
        stars: 5,
        achievement: "Weather Watcher",
        insight: "Persistent low mood",
      },
      {
        text: "Stuck in the storm 🌧️",
        value: 3,
        stars: 3,
        achievement: "Storm Survivor",
        insight: "Significant mood impact",
      },
    ],
  },
  {
    id: "future",
    text: "Level 2: Future Vision! What do you see ahead? ✨",
    options: [
      {
        text: "Future's looking bright! ✨",
        value: 0,
        stars: 10,
        achievement: "Future Seer",
        insight: "Optimistic outlook",
      },
      {
        text: "Some uncertainty 🤔",
        value: 1,
        stars: 8,
        achievement: "Path Finder",
        insight: "Mixed outlook",
      },
      {
        text: "Foggy road ahead 🌫️",
        value: 2,
        stars: 5,
        achievement: "Fog Navigator",
        insight: "Uncertain future",
      },
      {
        text: "Can't see the light 🔦",
        value: 3,
        stars: 3,
        achievement: "Light Seeker",
        insight: "Challenging outlook",
      },
    ],
  },
  {
    id: "selfEvaluation",
    text: "Level 3: Self-Quest! How do you feel about your journey? 🌟",
    options: [
      {
        text: "Proud of my path! 🏆",
        value: 0,
        stars: 10,
        achievement: "Self Champion",
        insight: "Positive self-image",
      },
      {
        text: "Some ups and downs 🎢",
        value: 1,
        stars: 8,
        achievement: "Growth Seeker",
        insight: "Mixed self-perception",
      },
      {
        text: "Not my best self 📉",
        value: 2,
        stars: 5,
        achievement: "Self Explorer",
        insight: "Self-critical",
      },
      {
        text: "Feeling defeated 🎯",
        value: 3,
        stars: 3,
        achievement: "Phoenix Rising",
        insight: "Low self-worth",
      },
    ],
  },
  {
    id: "satisfaction",
    text: "Level 4: Joy Quest! Having fun with daily activities? 🎮",
    options: [
      {
        text: "Living my best life! 🌈",
        value: 0,
        stars: 10,
        achievement: "Joy Master",
        insight: "High satisfaction",
      },
      {
        text: "It's okay I guess 🤷",
        value: 1,
        stars: 8,
        achievement: "Balance Keeper",
        insight: "Moderate satisfaction",
      },
      {
        text: "Not really feeling it 😕",
        value: 2,
        stars: 5,
        achievement: "Path Seeker",
        insight: "Low satisfaction",
      },
      {
        text: "Nothing feels good 😔",
        value: 3,
        stars: 3,
        achievement: "New Dawn",
        insight: "Very low satisfaction",
      },
    ],
  },
  {
    id: "guilt",
    text: "Level 5: Peace Quest! How's your inner peace? 🕊️",
    options: [
      {
        text: "All good with myself! 👍",
        value: 0,
        stars: 10,
        achievement: "Peace Keeper",
        insight: "Self-acceptance",
      },
      {
        text: "Minor regrets 🤏",
        value: 1,
        stars: 8,
        achievement: "Growth Embracer",
        insight: "Minor guilt",
      },
      {
        text: "Feeling pretty bad 😟",
        value: 2,
        stars: 5,
        achievement: "Truth Seeker",
        insight: "Significant guilt",
      },
      {
        text: "Can't forgive myself 💔",
        value: 3,
        stars: 3,
        achievement: "Self Healer",
        insight: "Severe guilt",
      },
    ],
  },
  {
    id: "energy",
    text: "Level 6: Energy Quest! What's your power level? ⚡",
    options: [
      {
        text: "Charged up! ⚡",
        value: 0,
        stars: 10,
        achievement: "Energy Star",
        insight: "High energy",
      },
      {
        text: "Battery at 50% 🔋",
        value: 1,
        stars: 8,
        achievement: "Power Saver",
        insight: "Moderate energy",
      },
      {
        text: "Running low 🪫",
        value: 2,
        stars: 5,
        achievement: "Power Seeker",
        insight: "Low energy",
      },
      {
        text: "Empty tank 🛑",
        value: 3,
        stars: 3,
        achievement: "Rest Master",
        insight: "Very low energy",
      },
    ],
  },
  {
    id: "decisions",
    text: "Level 7: Choice Master! How's decision-making going? 🎯",
    options: [
      {
        text: "Making choices like a pro! 🎯",
        value: 0,
        stars: 10,
        achievement: "Decision Master",
        insight: "Strong decisiveness",
      },
      {
        text: "Take my time deciding 🤔",
        value: 1,
        stars: 8,
        achievement: "Thoughtful Chooser",
        insight: "Moderate indecision",
      },
      {
        text: "Choices are hard 😕",
        value: 2,
        stars: 5,
        achievement: "Choice Explorer",
        insight: "Decision difficulty",
      },
      {
        text: "Can't decide anything 🌀",
        value: 3,
        stars: 3,
        achievement: "Path Finder",
        insight: "Severe indecision",
      },
    ],
  },
  {
    id: "selfImage",
    text: "Level 8: Mirror Quest! How do you see yourself? 🪞",
    options: [
      {
        text: "Looking good! 🌟",
        value: 0,
        stars: 10,
        achievement: "Self Star",
        insight: "Positive self-image",
      },
      {
        text: "Could look better 🪞",
        value: 1,
        stars: 8,
        achievement: "Image Explorer",
        insight: "Mild concerns",
      },
      {
        text: "Not liking what I see 👀",
        value: 2,
        stars: 5,
        achievement: "Mirror Master",
        insight: "Image issues",
      },
      {
        text: "Major changes noticed 📉",
        value: 3,
        stars: 3,
        achievement: "Self Seeker",
        insight: "Severe concerns",
      },
    ],
  },
  {
    id: "patience",
    text: "Level 9: Zen Quest! How's your patience meter? 🌡️",
    options: [
      {
        text: "Cool as a cucumber 🥒",
        value: 0,
        stars: 10,
        achievement: "Zen Master",
        insight: "Good emotional regulation",
      },
      {
        text: "A bit edgy lately 🎭",
        value: 1,
        stars: 8,
        achievement: "Peace Seeker",
        insight: "Mild irritability",
      },
      {
        text: "Getting frustrated easily 😤",
        value: 2,
        stars: 5,
        achievement: "Balance Walker",
        insight: "Moderate irritability",
      },
      {
        text: "Everything bugs me 🌋",
        value: 3,
        stars: 3,
        achievement: "Calm Seeker",
        insight: "High irritability",
      },
    ],
  },
  {
    id: "support",
    text: "Level 10: Support Check! How's your safety level? 🛡️",
    options: [
      {
        text: "Feeling safe and supported 🌟",
        value: 0,
        stars: 10,
        achievement: "Support Star",
        insight: "Good support system",
      },
      {
        text: "Could use someone to talk to 🤝",
        value: 1,
        stars: 8,
        achievement: "Connection Seeker",
        insight: "Seeking support",
      },
      {
        text: "Having scary thoughts 🆘",
        value: 2,
        stars: 5,
        achievement: "Brave Voice",
        insight: "Needs support",
        requiresSupport: true,
      },
      {
        text: "Need help right now 🚨",
        value: 3,
        stars: 3,
        achievement: "Help Seeker",
        insight: "Immediate assistance needed",
        requiresCrisis: true,
      },
    ],
  },
  {
    id: "conflict",
    text: "Level 11: Harmony Check! How are you handling conflicts? 🤝",
    options: [
      {
        text: "Handling conflicts well 🤝",
        value: 0,
        stars: 10,
        achievement: "Peace Maker",
        insight: "Good conflict resolution",
      },
      {
        text: "Getting annoyed easily 😤",
        value: 1,
        stars: 8,
        achievement: "Balance Seeker",
        insight: "Mild irritability",
      },
      {
        text: "Having angry outbursts 💢",
        value: 2,
        stars: 5,
        achievement: "Calm Seeker",
        insight: "Needs anger support",
      },
      {
        text: "Feeling aggressive 🚫",
        value: 3,
        stars: 3,
        achievement: "Peace Walker",
        insight: "Requires immediate support",
        requiresSupport: true,
      },
    ],
  },
];

// Define the state type for messages
interface Message {
  sender: "bot" | "user";
  text: string;
  options?: string[];
  id: number;
  timestamp: string;
}

export default function Explorer() {
  const [messages, setMessages] = useState<Message[]>([]); // Adjust the type as needed
  const [gameState, setGameState] = useState<GameState>({
    stars: 0,
    level: 1,
    currentIndex: -1,
    streak: 0, // TODO need to pull from previous sessions
  });
  useEffect(() => {
    setMessages([
      {
        id: 1,
        sender: "bot",
        text: "Hey! 👋 Ready to explore your emotional world? You'll earn stars and unlock cool insights!",
        options: ["Start Quest", "How does it work?"],
        timestamp: new Date().toISOString(),
      },
    ]);  
  }, []);

  const addMessage = (message: Message) => {
    console.log("Adding message:", message);
    setMessages((prev) => [...prev, message]);
  };

  const showCrisisResources = () => {
    addMessage({
      id: messages.length + 1,
      sender: "bot",
      text: `🆘 Important Support Resources:/n/n
      
      • Crisis Helpline: Available 24/7 - Call or Text 988/n
      • Teen Crisis Text Line: Text HOME to 741741/n
      • Emergency: Call 911/n/n
      
      Remember: You're not alone. Reaching out is a sign of strength! 💪/n
      Would you like to:`,
      options: ["Talk to Someone Now", "Continue Quest", "Take a Break"],
      timestamp: new Date().toISOString(),
    });
  };

  const handleUserChoice = (choice: string) => {
    addMessage({ 
      id: messages.length + 1,
      timestamp: new Date().toISOString(),
      sender: "user", 
      text: choice });

    if (choice === "Start Quest") {
      setTimeout(() => {
        addMessage({
          id: messages.length + 1,
          timestamp: new Date().toISOString(),
          sender: "bot",
          text:
            "Awesome! Every honest answer earns stars and unlocks achievements. Ready?",
          options: ["Begin Adventure"],
        });
      }, 600);
    } else if (
      choice === "Begin Adventure" ||
      choice === "Start New Quest" ||
      choice === "Continue Quest"
    ) {
      setGameState({
        stars: 0,
        level: 1,
        currentIndex: 0,

      });
      setTimeout(() => {
        console.log("Adding first question...");
        if (questions && questions.length > 0) {
          const firstQuestion = questions[0];
          addMessage({
            id: messages.length + 1,
            timestamp: new Date().toISOString(),
            sender: "bot",
            text: firstQuestion.text,
            options: firstQuestion.options.map((opt) => opt.text),
          });
        } else {
          console.error("Questions array is empty or undefined");
        }
      }, 100);
    } else if (choice === "Take a Break") {
      addMessage({
        id: messages.length + 1,
        timestamp: new Date().toISOString(),
        sender: "bot",
        text:
          "Thank you for sharing your feelings today! Taking care of your emotional well-being is important. Come back anytime - we're here to support you! 💫",
        options: ["Start New Quest", "Get Support Resources"],
      });
    } else if (
      choice === "Talk to Someone Now" ||
      choice === "Get Support Resources"
    ) {
      showCrisisResources();
    } else if (choice === "How does it work?") {
      addMessage({
        id: messages.length + 1,
        timestamp: new Date().toISOString(),
        sender: "bot",
        text:
          "Here's how the Mood Explorer works:\n\n• Answer questions about your feelings\n• Earn stars for honest responses\n• Get insights about your emotional state\n• Track your progress across levels\n• Access support resources when needed\n\nReady to begin?",
        options: ["Start Quest", "Get Support Resources"],
      });
    } else {
      handleResponse(choice);
    }
  };

  const handleResponse = (optionText: string) => {
    if (gameState.currentIndex >= questions.length) return;

    const currentQuestion = questions[gameState.currentIndex];
    const option = currentQuestion.options.find((opt) => opt.text === optionText);
    if (!option) return;
    setGameState((prev) => ({
      ...prev,
      currentIndex: prev.currentIndex + 1,
      stars: prev.stars + option.stars,
      level: Math.min(prev.level + 1, 11),
      streak: (prev.streak ?? 0) + 1,
      bdiScore: (prev.bdiScore ?? 0) + option.value,
      insights: [...(prev.insights ?? []), option.insight],
      achievements: [...(prev.achievements ?? []), option.achievement],
    }));

    const nextIndex = gameState.currentIndex + 1;
    setTimeout(() => {
      if (nextIndex < questions.length) {
        const nextQuestion = questions[nextIndex];
        if (nextQuestion) {
          addMessage({
            id: messages.length + 1,
            timestamp: new Date().toISOString(),
            sender: "bot",
            text: nextQuestion.text,
            options: nextQuestion.options.map((opt) => opt.text),
          });
        }
      } else {
        showResults();
      }
    }, 600);
  };

  const generateMoodSummary = () => {
    const bdiScore = gameState.bdiScore ?? 0;

    if (bdiScore <= 5)
      return "Your responses show a lot of resilience! Keep that positive energy flowing! 🌟";
    if (bdiScore <= 10)
      return "You're handling things pretty well, with some ups and downs - that's totally normal! 😊";
    if (bdiScore <= 15)
      return "Looks like you're facing some challenges. Remember: it's okay to reach out for support! 💪";
    return "Seems like you're going through a tough time. Please know that support is available whenever you need it! 🤝";
  };

  const showResults = () => {
    const summary = generateMoodSummary();

    const totalStars = gameState.stars;
    const bdiScore = gameState.bdiScore ?? 0;

    addMessage({
      id: messages.length + 1,
      timestamp: new Date().toISOString(),
      sender: "bot",
      text: `🎉 Quest Complete! /n/n
        Your Journey Stats:/n
         Total ⭐: ${totalStars}/n
         Score 🏆: ${bdiScore}/n/n/n
        
        ${summary}/n/n
        
        Your Insights:/n
        ${gameState.insights?.join(" 😕 ")}/n/n/n

        Achievements Unlocked:/n
        ${gameState.achievements?.join(" 🌟 ")}/n/n/n
        
        What would you like to do next?`,
      options: ["Start New Quest", "Take a Break", "Get Support Resources"],
    });
  };

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight; // Scroll to bottom
  }, [messages]);
  


  return (
    <Layout>
      <div className="flex flex-col h-screen bg-primary p-2">
        <div className="max-w-7xl mx-auto w-full flex flex-col flex-1" style={{ height: '100%' }}>
          <ChatHeader stars={gameState.stars} level={gameState.level} profile={JSON.parse('{}')} messages={messages}/>
          
          <div
            className="flex-1 bg-lightest rounded-lg p-5 overflow-y-auto mb-5"
            style={{ maxHeight: '100%' }}
            ref={messagesContainerRef}>
            <div className="w-full max-w-100% mx-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={clsx(
                    'flex mb-1',
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={clsx(
                      'max-w-[65%] rounded-lg border-2 border-darkest shadow-lg',
                      message.sender === 'user' ? 'p-2 bg-darkest text-white' : 'p-3 bg-lighter text-darkest'
                    )}
                  >
                    {message.text.split('/n').map((line, idx) => (
                      <p key={idx} className="m-0 mb-1 text-md">{line}</p>
                    ))}
                    {message.options && (
                      <div className="mt-2">
                        {Array.from({ length: Math.ceil(message.options.length / 2) }).map((_, rowIdx) => (
                          <div className="flex mb-2" key={rowIdx}>
                            <Button
                              variant="outline"
                              onClick={() => message.options && handleUserChoice(message.options[rowIdx * 2])}
                              className="text-sm bg-darker border-2 border-darkest text-white w-1/2 mr-2 hover:bg-darkest focus:ring-[#5999ab] focus:bg-darkest"
                            >
                              {message.options && message.options[rowIdx * 2]}
                            </Button>
                            {message.options && message.options[rowIdx * 2 + 1] && (
                              <Button
                                variant="outline"
                                onClick={() => message.options && handleUserChoice(message.options[rowIdx * 2 + 1])}
                                className="text-sm bg-darker border-2 border-darkest text-white w-1/2 hover:bg-darkest focus:ring-[#5999ab] focus:bg-darkest"
                              >
                                {message.options[rowIdx * 2 + 1]}
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}