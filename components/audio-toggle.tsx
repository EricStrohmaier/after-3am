"use client"

import { Volume2, VolumeX } from "lucide-react"

interface AudioToggleProps {
  enabled: boolean
  setEnabled: (enabled: boolean) => void
}

export default function AudioToggle({ enabled, setEnabled }: AudioToggleProps) {
  return (
    <button
      onClick={() => setEnabled(!enabled)}
      className="p-2 rounded-full bg-black/50 border border-gray-800 text-gray-500 hover:text-white transition-colors"
      aria-label={enabled ? "Disable audio" : "Enable audio"}
    >
      {enabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
    </button>
  )
}
