"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Send } from "lucide-react";

// Mode-specific placeholder text
const PLACEHOLDERS = {
  advice: "Ask for surreal advice...",
  confession: "Share a late-night confession...",
  tarot: "Ask a question for your tarot reading...",
  prompt: "Answer the 3AM prompt...",
  story: "Start a strange story...",
  dream: "Describe your ordinary day...",
  default: "Ask anything...",
};

// Mode-specific prompts for the 3AM Prompts mode
const RANDOM_PROMPTS = [
  "What's something you regret that rhymes with 'lasagna'?",
  "If your shadow could speak, what would it whisper when you're not listening?",
  "What color is the voice in your head when you're falling asleep?",
  "If you could rename the moon, what would you call it and why?",
  "What's the strangest thing you've ever done while everyone else was sleeping?",
  "If your reflection could step out of the mirror for one night, where would it go?",
  "What's a memory you're not sure is real or a dream?",
  "If you could taste a sound, which would be the most delicious?",
  "What's something you've never told anyone because it sounds too strange?",
  "If you could speak to your house when no one else is home, what would you ask it?",
];

// Define message interface for conversation history
interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface QuestionInputProps {
  mode: string;
  setQuestion: (question: string) => void;
  setResponse: (response: string) => void;
  setIsTyping: (isTyping: boolean) => void;
  conversationHistory: Message[];
  setConversationHistory: (history: Message[]) => void;
  isCentered?: boolean;
}

export default function QuestionInput({
  mode,
  setQuestion,
  setResponse,
  setIsTyping,
  conversationHistory,
  setConversationHistory,
  isCentered = false,
}: QuestionInputProps) {
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Set a random prompt for the 3AM Prompts mode
  if (mode === "prompt" && currentPrompt === "") {
    const randomIndex = Math.floor(Math.random() * RANDOM_PROMPTS.length);
    setCurrentPrompt(RANDOM_PROMPTS[randomIndex]);
  }

  // Reset the prompt when changing modes
  if (mode !== "prompt" && currentPrompt !== "") {
    setCurrentPrompt("");
  }

  const getPlaceholder = () => {
    if (mode === "prompt" && currentPrompt) {
      return currentPrompt;
    }
    return (
      PLACEHOLDERS[mode as keyof typeof PLACEHOLDERS] || PLACEHOLDERS.default
    );
  };

  // Parse the streaming response format
  const parseStreamingResponse = (chunk: string): string => {
    // Extract only the text content from the streaming format
    // The format is typically: f:{...} 0:"text" 0:"more text" ... e:{...}
    const textChunks = chunk.match(/0:"([^"]*)"/g) || [];
    return textChunks
      .map((match) => {
        // Extract the text between quotes after 0:"
        const content = match.substring(3, match.length - 1);
        // Remove escape characters (backslashes)
        return content.replace(/\\/g, "");
      })
      .join("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setIsTyping(true);

    // Store the question
    const userQuestion = input;
    setQuestion(userQuestion);

    // Add the user message to conversation history
    const userMessage: Message = {
      role: "user",
      content: userQuestion,
      timestamp: Date.now(),
    };

    const updatedHistory = [...conversationHistory, userMessage];
    setConversationHistory(updatedHistory);
    localStorage.setItem("conversationHistory", JSON.stringify(updatedHistory));

    // Clear input field
    setInput("");

    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new AbortController
    abortControllerRef.current = new AbortController();

    try {
      // Prepare conversation context for the API
      // Get the last few messages for context (limit to last 10 messages)
      const recentMessages = conversationHistory.slice(-10);

      // Send request to our API route
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: userQuestion,
          mode: mode,
          conversationHistory: recentMessages,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          // Parse the streaming format to extract just the text
          const parsedText = parseStreamingResponse(chunk);
          fullText += parsedText;

          // Update the response as it streams in
          setResponse(fullText);

          // Update the assistant message in conversation history
          const assistantMessage: Message = {
            role: "assistant",
            content: fullText,
            timestamp: Date.now(),
          };

          // Find if there's already an assistant message for this response and update it,
          // otherwise add a new one
          const lastMessage = updatedHistory[updatedHistory.length - 1];
          let newHistory;

          if (lastMessage && lastMessage.role === "assistant") {
            // Update the last assistant message
            newHistory = [...updatedHistory.slice(0, -1), assistantMessage];
          } else {
            // Add a new assistant message
            newHistory = [...updatedHistory, assistantMessage];
          }

          setConversationHistory(newHistory);
          localStorage.setItem(
            "conversationHistory",
            JSON.stringify(newHistory)
          );
        }
      }

      // If it's the prompt mode, set a new random prompt
      if (mode === "prompt") {
        const randomIndex = Math.floor(Math.random() * RANDOM_PROMPTS.length);
        setCurrentPrompt(RANDOM_PROMPTS[randomIndex]);
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Error fetching response:", error);
        setResponse(
          "The void is silent tonight. Try again when the stars align."
        );
      }
    } finally {
      setIsSubmitting(false);
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  // Different styles based on whether the input is centered or at the bottom
  if (isCentered) {
    return (
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative border-b border-gray-800 overflow-hidden transition-all duration-300">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={getPlaceholder()}
            className="w-full bg-transparent py-3 px-4 pr-12 text-white placeholder-gray-600 focus:outline-none resize-none h-[50px] text-lg"
            disabled={isSubmitting}
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (input.trim() && !isSubmitting) {
                  handleSubmit(e as unknown as React.FormEvent);
                }
              }
            }}
            style={{ overflowY: "auto" }}
          />
          <button
            type="submit"
            className="absolute right-2 bottom-2 p-2 rounded-full text-gray-500 hover:text-white transition-colors disabled:opacity-50"
            disabled={!input.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <div className="h-6 w-6 border-t-2 border-r-2 border-white rounded-full animate-spin" />
            ) : (
              <Send className="h-6 w-6" />
            )}
          </button>
        </div>
        <div className="text-xs text-gray-600 mt-3 text-center">
          Press Enter to send, Shift+Enter for new line
        </div>
      </form>
    );
  }

  // Regular bottom-aligned input
  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative border-t border-gray-800 overflow-hidden">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={getPlaceholder()}
          className="w-full bg-transparent py-2 px-4 pr-12 text-white placeholder-gray-600 focus:outline-none resize-none min-h-[50px] max-h-[120px]"
          disabled={isSubmitting}
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (input.trim() && !isSubmitting) {
                handleSubmit(e as unknown as React.FormEvent);
              }
            }
          }}
          style={{ overflowY: "auto" }}
        />
        <button
          type="submit"
          className="absolute right-2 bottom-2 p-2 rounded-full text-gray-500 hover:text-white transition-colors disabled:opacity-50"
          disabled={!input.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <div className="h-5 w-5 border-t-2 border-r-2 border-white rounded-full animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>
      <div className="text-xs text-gray-600 mt-2 text-center">
        Press Enter to send, Shift+Enter for new line
      </div>
    </form>
  );
}
