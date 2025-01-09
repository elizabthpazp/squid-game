import React from 'react'
import { SquidGameLogo } from './SquidGameLogo'

interface DeadScreenProps {
  onReplay: () => void
}

const DeadScreen: React.FC<DeadScreenProps> = ({ onReplay }) => {
  return (
    <div className="dead ui is-visible">
      <SquidGameLogo />
      <h1>You died!</h1>
      <p>
        Oops, it looks like you were moving too much or you reached the timeout...
      </p>
      <button className="cta replay replay1 is-ready" onClick={onReplay}>Replay</button>
    </div>
  )
}

export default DeadScreen

