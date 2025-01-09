import React from 'react'
import { SquidGameLogo } from './SquidGameLogo'

interface WinScreenProps {
  onReplay: () => void
}

const WinScreen: React.FC<WinScreenProps> = ({ onReplay }) => {
  return (
    <div className="win ui is-visible">
      <SquidGameLogo />
      <h1>You won!</h1>
      <p>
        Well done, you survived... for now.
      </p>
      <button className="cta replay replay2 is-ready" onClick={onReplay}>Replay</button>
    </div>
  )
}

export default WinScreen

