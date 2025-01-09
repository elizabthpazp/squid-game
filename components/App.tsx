'use client'

import React, { useState, useCallback } from 'react'
import Game from './Game'
import HowTo from './HowTo'
import DeadScreen from './DeadScreen'
import WinScreen from './WinScreen'

const App: React.FC = () => {
  const [gameState, setGameState] = useState<'howto' | 'playing' | 'dead' | 'win'>('howto')

  const startGame = () => setGameState('playing')
  const endGame = useCallback((result: 'dead' | 'win') => {
    setGameState(result)
  }, [])
  const replay = () => setGameState('playing')

  return (
    <div className={`container ${gameState === 'playing' ? 'is-playing' : ''}`}>
      {gameState === 'howto' && <HowTo onStart={startGame} />}
      {gameState === 'playing' && <Game onEnd={endGame} />}
      {gameState === 'dead' && <DeadScreen onReplay={replay} />}
      {gameState === 'win' && <WinScreen onReplay={replay} />}
    </div>
  )
}

export default App

