import { useEffect, useState } from 'react'
import { sound } from '../audio/SoundEngine'

export function AudioControls() {
  const [enabled, setEnabled] = useState(true)
  const [volume, setVolume] = useState(0.55)
  const [unlocked, setUnlocked] = useState(sound.isUnlocked)

  useEffect(() => {
    const id = setInterval(() => setUnlocked(sound.isUnlocked), 500)
    return () => clearInterval(id)
  }, [])

  const activate = async () => {
    await sound.unlock()
    sound.startAmbient()
    sound.click()
    setUnlocked(true)
  }

  return (
    <div className="audio-controls">
      {!unlocked ? (
        <button type="button" className="nx-btn" style={{ padding: '0.45rem 0.9rem' }} onClick={activate}>
          ACTIVATE AUDIO
        </button>
      ) : (
        <>
          <button
            type="button"
            className="nx-btn"
            style={{ padding: '0.4rem 0.8rem' }}
            onClick={() => {
              const next = !enabled
              setEnabled(next)
              sound.setEnabled(next)
              if (next) {
                sound.startAmbient()
                sound.click()
              }
            }}
            aria-pressed={enabled}
          >
            {enabled ? 'AUDIO ON' : 'AUDIO OFF'}
          </button>
          <label>
            VOL
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => {
                const v = Number(e.target.value)
                setVolume(v)
                sound.setVolume(v)
              }}
              aria-label="Master volume"
            />
          </label>
        </>
      )}
    </div>
  )
}
