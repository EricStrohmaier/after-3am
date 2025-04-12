"use client"

import { useState, useEffect, useRef } from "react"

interface ResponseDisplayProps {
  response: string
  isTyping: boolean
  audioEnabled: boolean
}

export default function ResponseDisplay({ response, isTyping, audioEnabled }: ResponseDisplayProps) {
  const [displayedResponse, setDisplayedResponse] = useState("")
  const fullResponseRef = useRef("")
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Update the displayed response with typing effect
  useEffect(() => {
    if (response !== fullResponseRef.current) {
      fullResponseRef.current = response

      // Clear any existing typing interval
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current)
      }

      // If there's a response, start the typing effect
      if (response) {
        let index = 0
        setDisplayedResponse("")

        // Slow, suspenseful typing effect
        typingIntervalRef.current = setInterval(() => {
          if (index < fullResponseRef.current.length) {
            setDisplayedResponse(fullResponseRef.current.substring(0, index + 1))
            index++
          } else {
            if (typingIntervalRef.current) {
              clearInterval(typingIntervalRef.current)
              typingIntervalRef.current = null
            }
          }
        }, 40) // Typing speed
      }
    }

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current)
      }
    }
  }, [response])

  // Handle ambient audio
  useEffect(() => {
    if (audioEnabled && response) {
      if (!audioRef.current) {
        audioRef.current = new Audio("/ambient.mp3")
        audioRef.current.volume = 0.2
        audioRef.current.loop = true
      }

      audioRef.current.play().catch((e) => console.error("Audio playback failed:", e))
    } else if (audioRef.current) {
      audioRef.current.pause()
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [audioEnabled, response])

  if (!displayedResponse) return null

  return (
    <div className="mt-12 w-full">
      <p className="text-xl font-light leading-relaxed tracking-wide">
        {displayedResponse}
        {isTyping && <span className="animate-pulse">|</span>}
      </p>
    </div>
  )
}
