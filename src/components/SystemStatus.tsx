import type { SystemTelemetry } from '../types'
import { EnergyCoreViz } from './EnergyCoreViz'

interface Props {
  telemetry: SystemTelemetry
}

function Bar({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div style={{ marginBottom: '0.65rem' }}>
      <div className="stat-row">
        <span>{label}</span>
        <strong>{Math.round(value)}%</strong>
      </div>
      <div className="stat-bar">
        <span style={{ width: `${value}%`, background: color, color }} />
      </div>
    </div>
  )
}

export function SystemStatus({ telemetry }: Props) {
  return (
    <div className="hud-frame panel-pad">
      <div className="panel-title">System Status</div>
      <Bar label="HULL INTEGRITY" value={telemetry.hull} color="var(--cyan)" />
      <Bar label="SHIELD MATRIX" value={telemetry.shields} color="#7b9fff" />
      <Bar label="REACTOR ENERGY" value={telemetry.energy} color="#ffb020" />
      <Bar label="CORE TEMP" value={telemetry.coreTemp} color="var(--crimson)" />
      <Bar label="SIGNAL STRENGTH" value={telemetry.signalStrength} color="var(--violet)" />
      <div className="panel-title" style={{ marginTop: '0.75rem' }}>
        Energy Core
      </div>
      <EnergyCoreViz intensity={0.55 + telemetry.energy / 250} />
    </div>
  )
}
