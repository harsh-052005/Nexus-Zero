import { useEffect, useState } from 'react'
import { sound } from '../audio/SoundEngine'

const STAGES = [
  'ARMING QUANTUM DRIVE...',
  'IGNITION SEQUENCE...',
  'BREAKING ORBIT...',
  'ENTERING SIGNAL VECTOR...',
]

interface Props {
  onComplete: () => void
}

export function LaunchSequence({ onComplete }: Props) {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    sound.ignite()
    const timers = STAGES.map((_, i) =>
      setTimeout(() => {
        setStage(i)
        if (i === 1) sound.charge()
        else sound.click()
      }, i * 900),
    )
    const done = setTimeout(onComplete, STAGES.length * 900 + 400)
    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(done)
    }
  }, [onComplete])

  return (
    <div className="screen launch-screen">
      <div
        style={{
          width: 4,
          height: `${20 + stage * 20}%`,
          maxHeight: 200,
          background: 'linear-gradient(180deg, #00f0ff, #7b2fff)',
          boxShadow: '0 0 40px #00f0ff',
          marginBottom: '2rem',
          transition: 'height 0.6s ease',
        }}
      />
      <p className="launch-text">{STAGES[stage]}</p>
      <p className="controls-hint" style={{ marginTop: '1.5rem', letterSpacing: '0.3em' }}>
        NX-0 DEPARTURE
      </p>
    </div>
  )
}
