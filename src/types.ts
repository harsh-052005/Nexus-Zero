export type AppScreen = 'boot' | 'command' | 'launch' | 'mission' | 'debrief'

export type MissionId = 'last-signal' | 'locked-alpha' | 'locked-beta'

export interface MissionMeta {
  id: MissionId
  codename: string
  designation: string
  threat: 'CRITICAL' | 'HIGH' | 'CLASSIFIED'
  status: 'AVAILABLE' | 'LOCKED'
  summary: string
  objectives: string[]
}

export interface SystemTelemetry {
  hull: number
  shields: number
  energy: number
  coreTemp: number
  signalStrength: number
  deepSpaceLink: number
}

export interface LogEntry {
  id: string
  time: string
  level: 'INFO' | 'WARN' | 'CRIT' | 'SYS'
  message: string
}

export interface HighScore {
  score: number
  dataFragments: number
  survived: number
  date: string
}

export interface GameStats {
  score: number
  kills: number
  dataFragments: number
  upgrades: number
  timeAlive: number
  won: boolean
}
