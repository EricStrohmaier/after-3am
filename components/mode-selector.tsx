"use client"

import { useState } from "react"
import { ChevronDown, Sparkles, MessageCircle, Compass, HelpCircle, BookOpen, Moon } from "lucide-react"

interface ModeSelectorProps {
  currentMode: string
  setMode: (mode: string) => void
}

export default function ModeSelector({ currentMode, setMode }: ModeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const modes = [
    { id: "advice", name: "Surreal Advice", icon: <HelpCircle className="h-4 w-4" /> },
    { id: "confession", name: "Late-Night Confession", icon: <MessageCircle className="h-4 w-4" /> },
    { id: "tarot", name: "Mini Tarot Reading", icon: <Sparkles className="h-4 w-4" /> },
    { id: "prompt", name: "3AM Prompt", icon: <Compass className="h-4 w-4" /> },
    { id: "story", name: "Write Together", icon: <BookOpen className="h-4 w-4" /> },
    { id: "dream", name: "Dream Journal", icon: <Moon className="h-4 w-4" /> },
  ]

  const currentModeData = modes.find((m) => m.id === currentMode) || modes[0]

  const handleSelectMode = (modeId: string) => {
    setMode(modeId)
    localStorage.setItem("lastMode", modeId)
    setIsOpen(false)
  }

  return (
    <div className="relative mb-8 w-full max-w-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-left text-sm"
      >
        <div className="flex items-center gap-2">
          {currentModeData.icon}
          <span>{currentModeData.name}</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-gray-900/90 border border-gray-800 rounded-md shadow-lg backdrop-blur-sm">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleSelectMode(mode.id)}
              className={`flex items-center gap-2 w-full px-4 py-2 text-left text-sm hover:bg-gray-800/50 transition-colors ${
                currentMode === mode.id ? "bg-gray-800/30 text-white" : "text-gray-300"
              }`}
            >
              {mode.icon}
              <span>{mode.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
