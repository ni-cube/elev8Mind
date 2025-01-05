// hooks/useEmotion.ts
export const useEmotion = () => {

  const emotionEmojis = {
    joy: {
      emoji: "😊",
      mood: "Happy",
      response: "That's wonderful! What's making you feel happy today?",
    },
    sadness: {
      emoji: "😢",
      mood: "Sad",
      response:
        "I'm here to listen. Would you like to talk about what's making you feel sad?",
    },
    anxiety: {
      emoji: "😨",
      mood: "Anxious",
      response: "I'm here for you. What's making you feel anxious?",
    },
    anger: {
      emoji: "😠",
      mood: "Angry",
      response: "I understand you're feeling frustrated. What's on your mind?",
    },
    fatigue: {
      emoji: "😪",
      mood: "Meh",
      response: "I'm here to listen. What's making you feel tired?",
    },
  };

  const setMood = (mood: 'joy' | 'sadness' | 'anxiety' | 'anger' | 'fatigue') => {
    localStorage.setItem('mood', mood);
  }

  // Function to get the emoji for the current mood
  const getCurrentEmoji = () => emotionEmojis[localStorage.getItem('mood') as 'joy' | 'sadness' | 'anxiety' | 'anger' | 'fatigue'];

  // Function to list all available emotions
  const getAllEmotions = () => {
    return Object.entries(emotionEmojis).map(([emotion, emoji]) => ({
      emotion,
      emoji,
    }));
  };

  return {
    getCurrentEmoji, // Current emoji for the current mood
    setMood, // Function to set mood
    getAllEmotions, // Function to get all available emotions
  };
};
