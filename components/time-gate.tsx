"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

interface TimeGateProps {
  toggleDevMode?: () => void
}

export default function TimeGate({ toggleDevMode }: TimeGateProps) {
  const [timeUntil3AM, setTimeUntil3AM] = useState("")

  useEffect(() => {
    const updateTimeUntil3AM = () => {
      const now = new Date()
      const next3AM = new Date(now)

      // Set to 3AM
      next3AM.setHours(3, 0, 0, 0)

      // If it's already past 3AM today, set to 3AM tomorrow
      if (now.getHours() >= 3) {
        next3AM.setDate(next3AM.getDate() + 1)
      }

      // Calculate time difference
      const diff = next3AM.getTime() - now.getTime()

      // Format as hours and minutes
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      setTimeUntil3AM(`${hours}h ${minutes}m`)
    }

    updateTimeUntil3AM()
    const interval = setInterval(updateTimeUntil3AM, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center space-y-8 text-center">
      <div className="flex items-center justify-center w-24 h-24 rounded-full border border-gray-800 mb-4">
        <Clock className="h-10 w-10 text-gray-500" />
      </div>

      <h1 className="text-3xl font-light tracking-wider">Come back later...</h1>

      <div className="mt-8 text-sm text-gray-500 max-w-md">
        <p className="mb-4">The veil between worlds is too thick right now.</p>
        <p className="mb-4">Return when the clock strikes 3.</p>
        <p className="text-xs opacity-50 mt-8">Time until the hour: {timeUntil3AM}</p>
      </div>
      {/* Hidden dev mode trigger - click the time 5 times to enable dev mode */}
      {toggleDevMode && (
        <p className="text-xs opacity-10 mt-12 cursor-default" onClick={toggleDevMode}>
          Developer override
        </p>
      )}
    </div>
  )
}
