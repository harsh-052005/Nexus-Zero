import type { MissionMeta } from '../types'

export const MISSIONS: MissionMeta[] = [
  {
    id: 'last-signal',
    codename: 'THE LAST SIGNAL',
    designation: 'NZ-PRIMUS-01',
    threat: 'CRITICAL',
    status: 'AVAILABLE',
    summary:
      'Experimental craft NX-0 receives a non-human transmission from an abandoned megastructure beyond charted space. Locate signal beacons, recover alien data, and breach the core.',
    objectives: [
      'Scan 3 quantum signal beacons',
      'Recover 5 data fragments',
      'Reach the megastructure core',
      'Survive hostile sentinel swarms',
    ],
  },
  {
    id: 'locked-alpha',
    codename: 'ECHO VEIL',
    designation: 'NZ-SEC-02',
    threat: 'HIGH',
    status: 'LOCKED',
    summary: 'Classified. Requires clearance level Ω after completing THE LAST SIGNAL.',
    objectives: [],
  },
  {
    id: 'locked-beta',
    codename: 'BLACK ORBIT',
    designation: 'NZ-SEC-03',
    threat: 'CLASSIFIED',
    status: 'LOCKED',
    summary: 'Access denied. Temporal quarantine in effect.',
    objectives: [],
  },
]
