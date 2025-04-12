"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import TimeGate from "@/components/time-gate";
import QuestionInput from "@/components/question-input";
import ResponseDisplay from "@/components/response-display";
import AudioToggle from "@/components/audio-toggle";
import ModeSelector from "@/components/mode-selector";

export default function Home() {
  const [isWithinTimeGate, setIsWithinTimeGate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [mode, setMode] = useState<string>("advice");
  const [question, setQuestion] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);

  // Add this state for development mode toggle
  const [devMode, setDevMode] = useState(() => {
    // Check if we're in development environment or have a saved preference
    const isDevelopment = process.env.NODE_ENV === "development";
    return isDevelopment;
  });

  // Check if current time is between 3AM and 4AM
  useEffect(() => {
    const checkTimeGate = () => {
      const now = new Date();
      const hour = now.getHours();

      // Only check time if not in dev mode
      if (devMode) {
        setIsWithinTimeGate(true);
      } else {
        setIsWithinTimeGate(hour === 3);
      }

      setLoading(false);
    };

    checkTimeGate();
    const interval = setInterval(checkTimeGate, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [devMode]);

  // Add a function to toggle dev mode
  const toggleDevMode = () => {
    const newDevMode = !devMode;
    setDevMode(newDevMode);
    localStorage.setItem("devMode", String(newDevMode));
  };

  // Load previous conversation from localStorage
  useEffect(() => {
    const savedQuestion = localStorage.getItem("lastQuestion");
    const savedResponse = localStorage.getItem("lastResponse");
    const savedMode = localStorage.getItem("lastMode");

    if (savedQuestion) setQuestion(savedQuestion);
    if (savedResponse) setResponse(savedResponse);
    if (savedMode) setMode(savedMode);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-white">
        <Clock className="h-8 w-8 animate-pulse" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-black text-white">
      <div className="absolute top-4 right-4 flex gap-2">
        <AudioToggle enabled={audioEnabled} setEnabled={setAudioEnabled} />
        {/* Dev mode toggle - hidden in production */}
        <button
          onClick={toggleDevMode}
          className="p-2 rounded-full bg-black/50 border border-gray-800 text-gray-500 hover:text-white transition-colors"
          aria-label={devMode ? "Disable dev mode" : "Enable dev mode"}
        >
          <span className="text-xs">{devMode ? "DEV" : "PROD"}</span>
        </button>
      </div>

      <div className="w-full max-w-3xl p-4 flex flex-col items-center justify-center min-h-screen">
        {isWithinTimeGate ? (
          <>
            <h1 className="text-2xl font-light mb-8 text-center opacity-70">
              Ask Me After 3AM
            </h1>

            <ModeSelector currentMode={mode} setMode={setMode} />

            <QuestionInput
              mode={mode}
              setQuestion={setQuestion}
              setResponse={setResponse}
              setIsTyping={setIsTyping}
            />

            <ResponseDisplay
              response={response}
              isTyping={isTyping}
              audioEnabled={audioEnabled}
            />
          </>
        ) : (
          <TimeGate toggleDevMode={toggleDevMode} />
        )}
      </div>
    </main>
  );
}
