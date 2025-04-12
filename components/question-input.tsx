"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Send } from "lucide-react"

// Mode-specific placeholder text
const PLACEHOLDERS = {
  advice: "Ask for surreal advice...",
  confession: "Share a late-night confession...",
  tarot: "Ask a question for your tarot reading...",
  prompt: "Answer the 3AM prompt...",
  story: "Start a strange story...",
  dream: "Describe your ordinary day...",
  default: "Ask anything...",
}

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
]

interface QuestionInputProps {
  mode: string
  setQuestion: (question: string) => void
  setResponse: (response: string) => void
  setIsTyping: (isTyping: boolean) => void
}

export default function QuestionInput({ mode, setQuestion, setResponse, setIsTyping }: QuestionInputProps) {
  const [input, setInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState("")
  const abortControllerRef = useRef<AbortController | null>(null)

  // Set a random prompt for the 3AM Prompts mode
  if (mode === "prompt" && currentPrompt === "") {
    const randomIndex = Math.floor(Math.random() * RANDOM_PROMPTS.length)
    setCurrentPrompt(RANDOM_PROMPTS[randomIndex])
  }

  // Reset the prompt when changing modes
  if (mode !== "prompt" && currentPrompt !== "") {
    setCurrentPrompt("")
  }

  const getPlaceholder = () => {
    if (mode === "prompt" && currentPrompt) {
      return currentPrompt
    }
    return PLACEHOLDERS[mode as keyof typeof PLACEHOLDERS] || PLACEHOLDERS.default
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isSubmitting) return

    setIsSubmitting(true)
    setIsTyping(true)

    // Store the question
    const userQuestion = input
    setQuestion(userQuestion)
    localStorage.setItem("lastQuestion", userQuestion)

    // Clear input field
    setInput("")

    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create a new AbortController
    abortControllerRef.current = new AbortController()

    try {
      // Send request to our API route
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: userQuestion,
          mode: mode,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let responseText = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          responseText += chunk

          // Update the response as it streams in
          setResponse(responseText)
          localStorage.setItem("lastResponse", responseText)
        }
      }

      // If it's the prompt mode, set a new random prompt
      if (mode === "prompt") {
        const randomIndex = Math.floor(Math.random() * RANDOM_PROMPTS.length)
        setCurrentPrompt(RANDOM_PROMPTS[randomIndex])
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Error fetching response:", error)
        setResponse("The void is silent tonight. Try again when the stars align.")
        localStorage.setItem("lastResponse", "The void is silent tonight. Try again when the stars align.")
      }
    } finally {
      setIsSubmitting(false)
      setIsTyping(false)
      abortControllerRef.current = null
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full mb-8">
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={getPlaceholder()}
          className="w-full bg-transparent border-b border-gray-800 py-4 px-2 text-white placeholder-gray-700 focus:outline-none focus:border-gray-500 transition-colors"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          className="absolute right-2 top-4 text-gray-500 hover:text-white transition-colors disabled:opacity-50"
          disabled={!input.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <div className="h-5 w-5 border-t-2 border-r-2 border-white rounded-full animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>
    </form>
  )
}
