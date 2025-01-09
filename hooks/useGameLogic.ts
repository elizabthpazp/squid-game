'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

const MAX_TIME = 60
const FINISH_DISTANCE = 100
const IN_GAME_MAX_DISTANCE = 4000
const MAX_MOVEMENT = 180

export const useGameLogic = (onEnd: (result: 'dead' | 'win') => void) => {
  const [distance, setDistance] = useState(0)
  const [isWatching, setIsWatching] = useState(true)
  const [distanceSinceWatching, setDistanceSinceWatching] = useState(0)
  const [timeLeft, setTimeLeft] = useState(MAX_TIME)
  
  const gameStateRef = useRef({ distance, distanceSinceWatching, timeLeft })

  const updateGameState = useCallback((x: number, y: number) => {
    if (!isWatching) {
      setDistance(prev => {
        const newDistance = prev + Math.hypot(x - prev, y - prev)
        gameStateRef.current.distance = newDistance
        return newDistance
      })
    } else {
      setDistanceSinceWatching(prev => {
        const newDistance = prev + Math.hypot(x - prev, y - prev)
        gameStateRef.current.distanceSinceWatching = newDistance
        return newDistance
      })
    }
  }, [isWatching])

  useEffect(() => {
    const checkGameState = () => {
      const { distance, distanceSinceWatching, timeLeft } = gameStateRef.current
      if (distance > IN_GAME_MAX_DISTANCE) {
        onEnd('win')
      } else if (distanceSinceWatching > MAX_MOVEMENT || timeLeft <= 0) {
        onEnd('dead')
      }
    }

    const interval = setInterval(checkGameState, 100) // Check game state every 100ms

    return () => clearInterval(interval)
  }, [onEnd])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const newTimeLeft = Math.max(0, prev - 1)
        gameStateRef.current.timeLeft = newTimeLeft
        return newTimeLeft
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const watchingInterval = setInterval(() => {
      setIsWatching(prev => !prev)
      if (!isWatching) {
        setDistanceSinceWatching(0)
        gameStateRef.current.distanceSinceWatching = 0
      }
    }, Math.random() * 3500 + 2500)

    return () => clearInterval(watchingInterval)
  }, [isWatching])

  return { distance, isWatching, distanceSinceWatching, timeLeft, updateGameState }
}

