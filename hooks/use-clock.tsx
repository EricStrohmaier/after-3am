"use client"

import { useState, useEffect } from "react"

export function useClock() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const hour = currentTime.getHours()
  const minute = currentTime.getMinutes()
  const second = currentTime.getSeconds()

  const isWithinTimeGate = hour === 3

  return {
    currentTime,
    hour,
    minute,
    second,
    isWithinTimeGate,
  }
}
