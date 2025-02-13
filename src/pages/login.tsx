// src/pages/login.tsx
import Layout from "@/layout";
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useRouter } from 'next/navigation'; // Use Next.js router
import { useEmotion } from "@/hooks/useEmotion";
import { Profile } from "@/types/profile";


const Login: React.FC = () => {
  // State for managing username, password, and error messages
  const [username, setUsername] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [gender, setGender] = useState<string>(""); // State for gender dropdown
  const [grade, setGrade] = useState<string>(""); // State for grade dropdown
  const { getAllEmotions } = useEmotion();
  const [password, setPassword] = useState<string>(""); // For password
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(["anger"]); // State for multiple emoji selections
  
  const router = useRouter(); // To navigate to another page after login

  useEffect(() => {
    const profile: Profile = {
      username: username, 
      gender, 
      grade, 
      emotKey: selectedEmotions[0]
    };
    localStorage.setItem('profile', JSON.stringify(profile));
  }, [username, gender, grade, selectedEmotions]);

  // Handle the form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Check if the username is empty for anonymous users or required for authenticated users
    if (!username) {
      setErrorMessage("Please fill out your user name.");
    } else if (username === "Nirajeet" && !password) {
      setErrorMessage("Please enter your password.");
    } else {
      setErrorMessage("");

      if(username === "Nirajeet" && password === "password") {
        router.push('/admin');
      } else {
        // Redirect to the dashboard page
        router.push('/dashboard'); // Navigate to the dashboard route
      }
    }
  };

  const handleClick = (e: FormEvent, emoji: "joy" | "sadness" | "anxiety" | "anger" | "sleepy" | "upset") => {
    e.preventDefault();
    // Toggle emoji in the selectedEmotions array
    setSelectedEmotions((prevSelectedEmotions) => {
      if (prevSelectedEmotions.includes(emoji)) {
        // If emoji is already selected, remove it
        return prevSelectedEmotions.filter((item) => item !== emoji);
      } else {
        // If emoji is not selected, add it
        return [...prevSelectedEmotions, emoji];
      }
    });
  }

  return (
  <Layout>
    <div className="flex justify-center items-center min-h-screen bg-[#72bbce] p-4">
      <div className="bg-white p-4 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-[#407786] text-2xl font-semibold text-center mb-6">
          Elev8 Mind 💙
        </h2>

        <form onSubmit={handleSubmit}>
        <div className="flex space-x-4 mb-4">
          <div className="flex-1">
            <label htmlFor="username" className="block text-[#2c5561] text-sm mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full p-3 border rounded-lg bg-[#e8f4f7] focus:outline-none focus:ring-2 focus:ring-[#5999ab]"
            />
          </div>
        </div>

        {/* Show password box if the username is Nirajeet */}
        {username === "Nirajeet" && (
          <div className="flex space-x-4 mb-4">
            <div className="flex-1">
              <label htmlFor="password" className="block text-[#2c5561] text-sm mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full p-3 border rounded-lg bg-[#e8f4f7] focus:outline-none focus:ring-2 focus:ring-[#5999ab]"
              />
            </div>
          </div>
        )}
        {username != "Nirajeet" && (
          <>
            <div className="mb-4">
              <label htmlFor="gender" className="block text-[#2c5561] text-sm mb-2">
                Gender
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setGender(e.target.value)}
                className="w-full p-3 border rounded-lg bg-[#e8f4f7] text-text focus:outline-none focus:ring-2 focus:ring-[#5999ab]"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="grade" className="block text-text text-sm mb-2">
                Grade
              </label>
              <select
                id="grade"
                value={grade}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setGrade(e.target.value)}
                className="w-full p-3 border rounded-lg bg-[#e8f4f7] text-[#2c4441] focus:outline-none focus:ring-2 focus:ring-[#5999ab]"
              >
                <option value="">Select Grade</option>
                <option value="9">9</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
              </select>
            </div>
          </>
        )}
        {/* Anonymous checkbox below the username and password */}
        <div className="mt-6 flex gap-3 flex-wrap justify-center mb-4">
          {getAllEmotions().map((emotion, emoji) => (
            <button
              key={emoji}
              onClick={(e) => handleClick(e, emotion.emotion as "joy" | "sadness" | "anxiety" | "anger" | "sleepy" | "upset")}
              className={`flex flex-col items-center p-2 border-none rounded-lg cursor-pointer
                    ${selectedEmotions.includes(emotion.emotion) ? 'bg-[#4db8ff] border-2 border-[#1d8fbc]' : 'bg-lighter'}
                    hover:bg-[#ffde59] focus:ring-2 focus:ring-[#5999ab]`}
            >
              <span className="text-4xl">{emotion.emoji.emoji}</span>
              <span className="text-sm text-text">{emotion.emotion}</span>
            </button>
          ))}
        </div>
        
          {errorMessage && <p className="text-red-500 text-sm mb-5">{errorMessage}</p>}

          <button
            type="submit"
            className="w-full py-3 bg-[#5999ab] text-white font-semibold rounded-lg hover:bg-[#407786] focus:outline-none focus:ring-2 focus:ring-[#5999ab]"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  </Layout> 
  );
};

export default Login;
