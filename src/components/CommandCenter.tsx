import { Suspense, useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { PlanetarySystem } from './PlanetarySystem'
import { TacticalRadar } from './TacticalRadar'
import { SystemStatus } from './SystemStatus'
import { MissionLog } from './MissionLog'
import { MissionSelect } from './MissionSelect'
import { AudioControls } from './AudioControls'
import { MISSIONS } from '../data/missions'
import { LastSignalEngine } from '../game/LastSignalEngine'
import { sound } from '../audio/SoundEngine'
import type { LogEntry, MissionId, SystemTelemetry } from '../types'

interface Props {
  onLaunch: () => void
}

function stamp(): string {
  const d = new Date()
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((n) => String(n).padStart(2, '0'))
    .join(':')
}

export function CommandCenter({ onLaunch }: Props) {
  const [selected, setSelected] = useState<MissionId>('last-signal')
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', time: stamp(), level: 'SYS', message: 'NEXUS ZERO command link online' },
    { id: '2', time: stamp(), level: 'INFO', message: 'Quantum core nominal' },
    { id: '3', time: stamp(), level: 'WARN', message: 'Unidentified deep-space ping' },
    { id: '4', time: stamp(), level: 'CRIT', message: 'THE LAST SIGNAL awaiting authorization' },
  ])
  const [telemetry, setTelemetry] = useState<SystemTelemetry>({
    hull: 100,
    shields: 94,
    energy: 88,
    coreTemp: 42,
    signalStrength: 67,
    deepSpaceLink: 91,
  })

  const mission = useMemo(() => MISSIONS.find((m) => m.id === selected)!, [selected])
  const highScore = LastSignalEngine.getHighScore()

  useEffect(() => {
    const id = setInterval(() => {
      setTelemetry((t) => ({
        ...t,
        shields: Math.max(80, Math.min(100, t.shields + (Math.random() - 0.45) * 3)),
        energy: Math.max(70, Math.min(100, t.energy + (Math.random() - 0.5) * 4)),
        coreTemp: Math.max(35, Math.min(68, t.coreTemp + (Math.random() - 0.5) * 2)),
        signalStrength: Math.max(40, Math.min(99, t.signalStrength + (Math.random() - 0.5) * 6)),
        deepSpaceLink: Math.max(75, Math.min(99, t.deepSpaceLink + (Math.random() - 0.5) * 2)),
      }))
    }, 1800)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const messages = [
      { level: 'INFO' as const, message: 'Holo-array recalibrated' },
      { level: 'SYS' as const, message: 'Orbital plot updated' },
      { level: 'WARN' as const, message: 'Micro-anomaly near sector 7' },
      { level: 'INFO' as const, message: 'Relay handshake stable' },
      { level: 'CRIT' as const, message: 'Signal pattern matches non-human origin' },
    ]
    const id = setInterval(() => {
      const m = messages[Math.floor(Math.random() * messages.length)]
      setLogs((prev) =>
        [
          {
            id: `${Date.now()}`,
            time: stamp(),
            level: m.level,
            message: m.message,
          },
          ...prev,
        ].slice(0, 40),
      )
    }, 5000)
    return () => clearInterval(id)
  }, [])

  const handleLaunch = () => {
    if (mission.status !== 'AVAILABLE') {
      sound.deny()
      return
    }
    sound.charge()
    setLogs((prev) => [
      {
        id: `${Date.now()}`,
        time: stamp(),
        level: 'CRIT',
        message: 'LAUNCH SEQUENCE INITIATED — NX-0 DEPARTING',
      },
      ...prev,
    ])
    onLaunch()
  }

  return (
    <div className="screen command-screen">
      <header className="command-header">
        <div className="brand-mark">
          NEXUS <span>ZERO</span>
        </div>
        <div className="header-meta">
          <span className="status-live">LINK ACTIVE</span>
          <span>SECTOR: UNKNOWN</span>
          <span>CLEARANCE: Ω</span>
          <span>BEST SCORE: {highScore}</span>
        </div>
        <AudioControls />
      </header>

      <div className="command-body">
        <div className="command-col">
          <SystemStatus telemetry={telemetry} />
          <div className="hud-frame panel-pad">
            <div className="panel-title">Tactical Radar</div>
            <TacticalRadar />
            <p className="controls-hint" style={{ marginTop: '0.6rem', textAlign: 'center' }}>
              SWEEP · {Math.round(telemetry.signalStrength)}% CONTACT DENSITY
            </p>
          </div>
        </div>

        <div className="command-center-stage">
          <div className="hud-frame stage-3d pulse-border">
            <div
              className="panel-title"
              style={{ position: 'absolute', top: 12, left: 16, zIndex: 2 }}
            >
              Holo Planetary Array
            </div>
            <Canvas camera={{ position: [0, 3.2, 7.5], fov: 42 }} dpr={[1, 1.75]}>
              <Suspense fallback={null}>
                <PlanetarySystem />
                <OrbitControls
                  enablePan={false}
                  minDistance={4}
                  maxDistance={14}
                  autoRotate
                  autoRotateSpeed={0.4}
                />
              </Suspense>
            </Canvas>
          </div>
          <div className="hud-frame panel-pad">
            <div className="panel-title">Selected Briefing</div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.25em',
                fontSize: '0.85rem',
                color: '#e8eef8',
                marginBottom: '0.5rem',
              }}
            >
              {mission.codename}
            </h2>
            <p className="controls-hint" style={{ marginBottom: '0.75rem' }}>
              {mission.summary}
            </p>
            {mission.objectives.length > 0 && (
              <ul className="controls-hint" style={{ paddingLeft: '1rem', marginBottom: '1rem' }}>
                {mission.objectives.map((o) => (
                  <li key={o} style={{ marginBottom: '0.25rem' }}>
                    {o}
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              className="nx-btn primary"
              onClick={handleLaunch}
              disabled={mission.status !== 'AVAILABLE'}
              onMouseEnter={() => sound.hover()}
            >
              INITIATE LAUNCH
            </button>
          </div>
        </div>

        <div className="command-col">
          <MissionSelect selected={selected} onSelect={setSelected} />
          <MissionLog entries={logs} />
        </div>
      </div>

      <footer className="command-footer">
        <span className="controls-hint">
          DEEP-SPACE LINK {Math.round(telemetry.deepSpaceLink)}% · CORE TEMP{' '}
          {Math.round(telemetry.coreTemp)}°Q
        </span>
        <span className="controls-hint">DRAG HOLO-ARRAY TO INSPECT · SELECT MISSION · LAUNCH</span>
      </footer>
    </div>
  )
}
