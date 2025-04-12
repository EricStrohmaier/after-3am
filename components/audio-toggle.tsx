"use client"

import { Volume2, VolumeX } from "lucide-react"
import { useAudio } from "./audio-provider"

export default function AudioToggle() {
  const { audioEnabled, setAudioEnabled } = useAudio();
  return (
    <button
      onClick={() => setAudioEnabled(!audioEnabled)}
      className="p-2 rounded-full bg-black/50 border border-gray-800 text-gray-500 hover:text-white transition-colors"
      aria-label={audioEnabled ? "Disable audio" : "Enable audio"}
    >
      {audioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
    </button>
  )
}
