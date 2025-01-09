import React from 'react'
import { SquidGameLogo } from './SquidGameLogo'

interface HowToProps {
  onStart: () => void
}

const HowTo: React.FC<HowToProps> = ({ onStart }) => {
  return (
    <div className="howto ui is-visible">
      <SquidGameLogo />
      <h1>Red Light, Green Light</h1>
      <p>
        You have 60 seconds to reach the end of the field.
      </p>
      <p>
        When the doll is not watching, move your head to move forward and make the top left counter reach 100m.
      </p>
      <p>
        But watch out to not move when the doll is watching you. If the movement sensor reaches 100% on the bottom right, you are eliminated.
      </p>
      <p className="note">This demo requires access to your webcam.<br />It currently doesn't work on iOS Safari.</p>
      <button className="cta start is-ready" onClick={onStart}>Start</button>
    </div>
  )
}

export default HowTo

