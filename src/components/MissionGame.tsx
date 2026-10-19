import { useCallback, useEffect, useRef, useState } from 'react'
import { LastSignalEngine, type GamePhase } from '../game/LastSignalEngine'
import { sound } from '../audio/SoundEngine'
import { AudioControls } from './AudioControls'
import type { GameStats } from '../types'

interface Objective {
  id: string
  label: string
  done: boolean
}

interface Props {
  onExit: (stats: GameStats) => void
}

export function MissionGame({ onExit }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<LastSignalEngine | null>(null)
  const [phase, setPhase] = useState<GamePhase>('playing')
  const [hull, setHull] = useState(100)
  const [shields, setShields] = useState(100)
  const [energy, setEnergy] = useState(100)
  const [score, setScore] = useState(0)
  const [data, setData] = useState(0)
  const [kills, setKills] = useState(0)
  const [objectives, setObjectives] = useState<Objective[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const statsRef = useRef<GameStats>({
    score: 0,
    kills: 0,
    dataFragments: 0,
    upgrades: 0,
    timeAlive: 0,
    won: false,
  })

  const resize = useCallback(() => {
    const canvas = canvasRef.current
    const engine = engineRef.current
    if (!canvas || !engine) return
    const parent = canvas.parentElement
    if (!parent) return
    engine.resize(parent.clientWidth, parent.clientHeight)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const engine = new LastSignalEngine(canvas)
    engineRef.current = engine
    engine.onStats = (s) => {
      setPhase(s.phase)
      setScore(s.score ?? 0)
      setData(s.dataFragments ?? 0)
      setKills(s.kills ?? 0)
      setObjectives(s.objectives)
      setHull(engine.player.hull)
      setShields(engine.player.shields)
      setEnergy(engine.player.energy)
      statsRef.current = {
        score: s.score ?? 0,
        kills: s.kills ?? 0,
        dataFragments: s.dataFragments ?? 0,
        upgrades: s.upgrades ?? 0,
        timeAlive: s.timeAlive ?? 0,
        won: s.phase === 'won',
      }
    }
    resize()
    engine.start()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      engine.destroy()
      engineRef.current = null
    }
  }, [resize])

  const finish = (won: boolean) => {
    sound.click()
    onExit({ ...statsRef.current, won })
  }

  return (
    <div className="screen mission-screen">
      <div className="mission-canvas-wrap">
        <canvas ref={canvasRef} tabIndex={0} aria-label="THE LAST SIGNAL gameplay" />
      </div>

      <div className="mission-hud">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="hud-frame panel-pad" style={{ minWidth: 200, pointerEvents: 'none' }}>
            <div className="panel-title">NX-0 Telemetry</div>
            <div className="stat-row">
              <span>HULL</span>
              <strong>{Math.round(hull)}</strong>
            </div>
            <div className="stat-bar">
              <span style={{ width: `${hull}%`, background: 'var(--cyan)', color: 'var(--cyan)' }} />
            </div>
            <div className="stat-row" style={{ marginTop: '0.4rem' }}>
              <span>SHIELDS</span>
              <strong>{Math.round(shields)}</strong>
            </div>
            <div className="stat-bar">
              <span style={{ width: `${shields}%`, background: '#7b9fff', color: '#7b9fff' }} />
            </div>
            <div className="stat-row" style={{ marginTop: '0.4rem' }}>
              <span>ENERGY</span>
              <strong>{Math.round(energy)}</strong>
            </div>
            <div className="stat-bar">
              <span style={{ width: `${energy}%`, background: '#ffb020', color: '#ffb020' }} />
            </div>
          </div>

          <div className="hud-frame panel-pad" style={{ minWidth: 220, pointerEvents: 'none' }}>
            <div className="panel-title">Objectives</div>
            {objectives.map((o) => (
              <div
                key={o.id}
                className="controls-hint"
                style={{
                  marginBottom: '0.35rem',
                  color: o.done ? 'var(--cyan)' : 'var(--silver-dim)',
                  textDecoration: o.done ? 'line-through' : 'none',
                }}
              >
                {o.done ? '☑' : '☐'} {o.label}
              </div>
            ))}
            <div className="controls-hint" style={{ marginTop: '0.6rem' }}>
              SCORE {score} · DATA {data}/5 · KILLS {kills}
            </div>
          </div>

          <div className="interactive" style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <button
              type="button"
              className="nx-btn"
              style={{ padding: '0.5rem 0.9rem' }}
              onClick={() => {
                sound.click()
                engineRef.current?.pause()
                setShowSettings(true)
              }}
            >
              MENU
            </button>
          </div>
        </div>

        <div
          className="hud-frame panel-pad controls-hint"
          style={{ alignSelf: 'flex-start', maxWidth: 420, pointerEvents: 'none' }}
        >
          WASD / ARROWS MOVE · MOUSE AIM · CLICK / SPACE FIRE · ESC PAUSE · FOLLOW BEACON MARKERS
        </div>
      </div>

      {(phase === 'paused' || showSettings) && phase !== 'won' && phase !== 'lost' && (
        <div className="overlay-menu">
          <div className="hud-frame overlay-card pulse-border">
            <h2>SYSTEMS PAUSED</h2>
            <p>Mission clock suspended. Hostile signatures remain in sector.</p>
            <div className="overlay-actions">
              <button
                type="button"
                className="nx-btn primary"
                onClick={() => {
                  sound.confirm()
                  setShowSettings(false)
                  engineRef.current?.resume()
                }}
              >
                RESUME
              </button>
              <button
                type="button"
                className="nx-btn"
                onClick={() => {
                  sound.click()
                  setShowSettings(false)
                  engineRef.current?.restart()
                }}
              >
                RESTART MISSION
              </button>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
                <AudioControls />
              </div>
              <button
                type="button"
                className="nx-btn danger"
                onClick={() => finish(false)}
              >
                ABORT TO COMMAND
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'won' && (
        <div className="overlay-menu">
          <div className="hud-frame overlay-card pulse-border">
            <h2>SIGNAL DECODED</h2>
            <p>
              The megastructure yields its final transmission. Humanity was never alone — and never
              the first.
            </p>
            <div className="debrief-stats">
              <div>
                <span>SCORE</span>
                <span>{score}</span>
              </div>
              <div>
                <span>DATA FRAGMENTS</span>
                <span>{data}</span>
              </div>
              <div>
                <span>HOSTILES NEUTRALIZED</span>
                <span>{kills}</span>
              </div>
            </div>
            <div className="overlay-actions">
              <button type="button" className="nx-btn primary" onClick={() => finish(true)}>
                RETURN TO COMMAND
              </button>
              <button
                type="button"
                className="nx-btn"
                onClick={() => {
                  sound.click()
                  engineRef.current?.restart()
                }}
              >
                REPLAY
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'lost' && (
        <div className="overlay-menu">
          <div className="hud-frame overlay-card">
            <h2 style={{ color: 'var(--crimson)' }}>HULL CRITICAL — SIGNAL LOST</h2>
            <p>NX-0 compromised. The megastructure continues broadcasting into the void.</p>
            <div className="debrief-stats">
              <div>
                <span>SCORE</span>
                <span>{score}</span>
              </div>
              <div>
                <span>DATA RECOVERED</span>
                <span>{data}</span>
              </div>
            </div>
            <div className="overlay-actions">
              <button
                type="button"
                className="nx-btn primary"
                onClick={() => {
                  sound.click()
                  engineRef.current?.restart()
                }}
              >
                REINITIALIZE
              </button>
              <button type="button" className="nx-btn danger" onClick={() => finish(false)}>
                ABORT TO COMMAND
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
