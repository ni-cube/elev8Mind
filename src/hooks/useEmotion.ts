// hooks/useEmotion.ts
import { emotionEmojis } from '@/utils/emotions';

export const useEmotion = () => {

  // Function to list all available emotions
  const getAllEmotions = () => {
    return Object.entries(emotionEmojis).map(([emotion, emoji]) => ({
      emotion,
      emoji,
    }));
  };


  return {
    getAllEmotions, // Function to get all available emotions
  };
};
