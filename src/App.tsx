import { useCallback, useState } from 'react'
import { BootSequence } from './components/BootSequence'
import { CommandCenter } from './components/CommandCenter'
import { LaunchSequence } from './components/LaunchSequence'
import { MissionGame } from './components/MissionGame'
import type { AppScreen, GameStats } from './types'
import { sound } from './audio/SoundEngine'

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('boot')
  const [lastStats, setLastStats] = useState<GameStats | null>(null)

  const enterCommand = useCallback(() => setScreen('command'), [])

  const startLaunch = useCallback(() => setScreen('launch'), [])

  const enterMission = useCallback(() => setScreen('mission'), [])

  const exitMission = useCallback((stats: GameStats) => {
    setLastStats(stats)
    setScreen('debrief')
    sound.startAmbient()
  }, [])

  const backToCommand = useCallback(() => {
    sound.click()
    setScreen('command')
  }, [])

  return (
    <>
      {screen === 'boot' && <BootSequence onEnter={enterCommand} />}
      {screen === 'command' && <CommandCenter onLaunch={startLaunch} />}
      {screen === 'launch' && <LaunchSequence onComplete={enterMission} />}
      {screen === 'mission' && <MissionGame onExit={exitMission} />}
      {screen === 'debrief' && (
        <div className="screen launch-screen">
          <div className="hud-frame overlay-card pulse-border">
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.3em',
                marginBottom: '0.75rem',
                color: lastStats?.won ? 'var(--cyan)' : 'var(--crimson)',
              }}
            >
              {lastStats?.won ? 'MISSION COMPLETE' : 'MISSION ABORTED'}
            </h2>
            <p className="controls-hint" style={{ marginBottom: '1.25rem', lineHeight: 1.6 }}>
              {lastStats?.won
                ? 'Transmission archived in the NEXUS vault. The future just changed.'
                : 'Partial telemetry recovered. The signal still waits beyond the veil.'}
            </p>
            {lastStats && (
              <div className="debrief-stats">
                <div>
                  <span>FINAL SCORE</span>
                  <span>{lastStats.score}</span>
                </div>
                <div>
                  <span>DATA FRAGMENTS</span>
                  <span>{lastStats.dataFragments}</span>
                </div>
                <div>
                  <span>KILLS</span>
                  <span>{lastStats.kills}</span>
                </div>
                <div>
                  <span>TIME ALIVE</span>
                  <span>{Math.floor(lastStats.timeAlive)}s</span>
                </div>
              </div>
            )}
            <button type="button" className="nx-btn primary" onClick={backToCommand}>
              RETURN TO COMMAND CENTER
            </button>
          </div>
        </div>
      )}
      <div className="noise-overlay" aria-hidden />
      <div className="vignette" aria-hidden />
      <div className="scanlines" aria-hidden />
    </>
  )
}
