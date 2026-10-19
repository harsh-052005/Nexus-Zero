import { MISSIONS } from '../data/missions'
import type { MissionId } from '../types'
import { sound } from '../audio/SoundEngine'

interface Props {
  selected: MissionId
  onSelect: (id: MissionId) => void
}

export function MissionSelect({ selected, onSelect }: Props) {
  return (
    <div className="hud-frame panel-pad" style={{ flex: 1, overflowY: 'auto' }}>
      <div className="panel-title">Classified Missions</div>
      {MISSIONS.map((m) => {
        const locked = m.status === 'LOCKED'
        return (
          <button
            key={m.id}
            type="button"
            className={`mission-card ${selected === m.id ? 'selected' : ''} ${locked ? 'locked' : ''}`}
            disabled={locked}
            onMouseEnter={() => sound.hover()}
            onClick={() => {
              if (locked) {
                sound.deny()
                return
              }
              sound.click()
              onSelect(m.id)
            }}
          >
            <h3>{m.codename}</h3>
            <div className="meta">
              {m.designation} · {m.status}
            </div>
            <div className="threat">THREAT: {m.threat}</div>
            <p style={{ marginTop: '0.4rem' }}>{m.summary}</p>
          </button>
        )
      })}
    </div>
  )
}
