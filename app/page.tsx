"use client";

import { useState, useEffect } from "react";
import { Clock, RefreshCcw } from "lucide-react";
import TimeGate from "@/components/time-gate";
import QuestionInput from "@/components/question-input";
import ResponseDisplay from "@/components/response-display";
import AudioToggle from "@/components/audio-toggle";
import ModeSelector from "@/components/mode-selector";

// Define message interface for conversation history
interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export default function Home() {
  const [isWithinTimeGate, setIsWithinTimeGate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<string>("advice");
  const [question, setQuestion] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);

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

  // Function to start a new conversation
  const startNewConversation = () => {
    setConversationHistory([]);
    setQuestion("");
    setResponse("");
    localStorage.removeItem("conversationHistory");
  };

  // Load previous conversation history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("conversationHistory");

    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory) as Message[];
        setConversationHistory(history);

        // Set the most recent messages if they exist
        if (history.length > 0) {
          const lastUserMessage = history
            .filter((msg) => msg.role === "user")
            .pop();
          const lastAIMessage = history
            .filter((msg) => msg.role === "assistant")
            .pop();

          if (lastUserMessage) setQuestion(lastUserMessage.content);
          if (lastAIMessage) setResponse(lastAIMessage.content);
        }
      } catch (e) {
        console.error("Error parsing conversation history:", e);
      }
    }
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
        <AudioToggle />
      </div>

      <div className="w-full max-w-3xl h-screen">
        {isWithinTimeGate ? (
          conversationHistory.length === 0 ? (
            // Initial centered layout when no conversation exists
            <div className="flex flex-col items-center justify-center h-full px-4">
              <h1 className="text-3xl font-light mb-12 text-center opacity-70">
                Ask Me After 3AM
              </h1>

              <div className="w-full max-w-xl mb-8">
                <ModeSelector currentMode={mode} setMode={setMode} />
              </div>

              <div className="w-full max-w-xl">
                <QuestionInput
                  mode={mode}
                  setQuestion={setQuestion}
                  setResponse={setResponse}
                  setIsTyping={setIsTyping}
                  conversationHistory={conversationHistory}
                  setConversationHistory={setConversationHistory}
                  isCentered={true}
                />
              </div>
            </div>
          ) : (
            // Chat timeline layout once conversation has started
            <div className="flex flex-col h-full animate-fadeIn">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <h1 className="text-xl font-light opacity-70">
                  Ask Me After 3AM
                </h1>
                <div className="flex items-center">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={startNewConversation}
                      className="p-2 text-gray-500 hover:text-white transition-colors"
                      aria-label="New Conversation"
                    >
                      <RefreshCcw className="h-4 w-4" />
                    </button>
                    <ModeSelector currentMode={mode} setMode={setMode} />
                  </div>
                </div>
              </div>

              {/* Chat container - takes up most of the space */}
              <div className="flex-1 overflow-hidden flex flex-col">
                <ResponseDisplay
                  response={response}
                  isTyping={isTyping}
                  conversationHistory={conversationHistory}
                />
              </div>

              {/* Input area - fixed at the bottom */}
              <div className="p-4">
                <QuestionInput
                  mode={mode}
                  setQuestion={setQuestion}
                  setResponse={setResponse}
                  setIsTyping={setIsTyping}
                  conversationHistory={conversationHistory}
                  setConversationHistory={setConversationHistory}
                  isCentered={false}
                />
              </div>
            </div>
          )
        ) : (
          <div className="flex items-center justify-center h-full">
            <TimeGate toggleDevMode={toggleDevMode} />
          </div>
        )}
      </div>
    </main>
  );
}
