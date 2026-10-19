import { useEffect, useState } from 'react'
import { sound } from '../audio/SoundEngine'

const LINES = [
  { text: 'INITIALIZING QUANTUM CORE...', delay: 400 },
  { text: 'ESTABLISHING DEEP-SPACE LINK...', delay: 1100 },
  { text: 'UNKNOWN SIGNAL DETECTED...', delay: 1900, warn: true },
  { text: 'MISSION AUTHORIZATION REQUIRED.', delay: 2700 },
]

interface Props {
  onEnter: () => void
}

export function BootSequence({ onEnter }: Props) {
  const [visible, setVisible] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const timers = LINES.map((line, i) =>
      setTimeout(() => {
        setVisible(i + 1)
        if (i === 0) sound.boot()
        else if (line.warn) sound.alarm()
        else sound.click()
      }, line.delay),
    )
    const readyTimer = setTimeout(() => setReady(true), 3400)
    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(readyTimer)
    }
  }, [])

  const handleEnter = async () => {
    await sound.unlock()
    sound.startAmbient()
    sound.confirm()
    onEnter()
  }

  return (
    <div className="screen boot-screen">
      <div className="boot-core" aria-hidden>
        <div className="boot-core-ring" />
        <div className="boot-core-ring" />
        <div className="boot-core-orb" />
      </div>
      <h1 className="boot-title">N E X U S&nbsp;&nbsp;Z E R O</h1>
      <p className="boot-subtitle">THE FUTURE IS NOT HUMAN.</p>
      <div className="boot-lines" aria-live="polite">
        {LINES.slice(0, visible).map((line, i) => (
          <div
            key={line.text}
            className={`boot-line ${line.warn ? 'warn' : ''} ${i === visible - 1 ? 'active' : ''}`}
            style={{ animationDelay: '0ms' }}
          >
            {'> '}
            {line.text}
          </div>
        ))}
      </div>
      {ready && (
        <div className="boot-cta">
          <button type="button" className="nx-btn primary" onClick={handleEnter}>
            AUTHORIZE ACCESS
          </button>
          <p className="controls-hint" style={{ marginTop: '1rem', textAlign: 'center' }}>
            AUDIO SYSTEMS ARM ON AUTHORIZATION
          </p>
        </div>
      )}
    </div>
  )
}
