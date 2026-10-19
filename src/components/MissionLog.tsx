import type { LogEntry } from '../types'

interface Props {
  entries: LogEntry[]
}

export function MissionLog({ entries }: Props) {
  return (
    <div className="hud-frame panel-pad pulse-border" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="panel-title">Mission Log</div>
      <div className="log-list">
        {entries.map((e) => (
          <div key={e.id} className="log-entry">
            <span style={{ color: 'var(--silver-dim)' }}>{e.time}</span>
            <span className={`lvl-${e.level}`}>{e.level}</span>
            <span>{e.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
