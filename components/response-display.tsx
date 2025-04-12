"use client";

import { useState, useEffect, useRef } from "react";
import { useAudio } from "./audio-provider";

// Define message interface for conversation history
interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ResponseDisplayProps {
  response: string;
  isTyping: boolean;
  conversationHistory: Message[];
}

export default function ResponseDisplay({
  response,
  isTyping,
  conversationHistory,
}: ResponseDisplayProps) {
  const [displayedResponse, setDisplayedResponse] = useState("");
  const fullResponseRef = useRef("");
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { audioEnabled } = useAudio();

  // Update the displayed response with typing effect
  useEffect(() => {
    if (response !== fullResponseRef.current) {
      fullResponseRef.current = response;

      // Clear any existing typing interval
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }

      // If there's a response, start the typing effect
      if (response) {
        let index = 0;
        setDisplayedResponse("");

        // Slow, suspenseful typing effect
        typingIntervalRef.current = setInterval(() => {
          if (index < fullResponseRef.current.length) {
            setDisplayedResponse(
              fullResponseRef.current.substring(0, index + 1)
            );
            index++;
          } else {
            if (typingIntervalRef.current) {
              clearInterval(typingIntervalRef.current);
              typingIntervalRef.current = null;
            }
          }
        }, 40); // Typing speed
      }
    }

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, [response]);

  // We no longer need to handle audio here as it's managed by the AudioProvider

  // Scroll to bottom when conversation updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [conversationHistory]);

  // If there's no conversation history, show nothing
  if (conversationHistory.length === 0) return null;

  return (
    <div className="w-full h-full flex flex-col">
      {/* Chat history container with auto-expanding height and scrolling */}
      <div
        ref={chatContainerRef}
        className="w-full flex-1 overflow-y-auto p-4 space-y-8 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
      >
        {conversationHistory.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 text-center">
              Ask a question to begin your late-night conversation...
            </p>
          </div>
        ) : (
          conversationHistory.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >

              
              {/* Message bubble */}
              <div
                className={`max-w-[75%] p-3 rounded-lg ${message.role === "user" 
                  ? "bg-gray-800 text-white" 
                  : "bg-gray-900 border border-gray-800 text-gray-300"}`}
              >
                <p className="text-sm font-light leading-relaxed">
                  {message.content}
                  {isTyping &&
                    index === conversationHistory.length - 1 &&
                    message.role === "assistant" && (
                      <span className="animate-pulse ml-1">|</span>
                    )}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              

            </div>
          ))
        )}
        
        {/* Add some bottom padding to ensure messages don't get hidden behind the input */}
        <div className="h-4"></div>
      </div>
    </div>
  );
}
