import { sound } from '../audio/SoundEngine'
import type { GameStats } from '../types'

export type GamePhase = 'playing' | 'paused' | 'won' | 'lost'

interface Vec {
  x: number
  y: number
}

interface Entity {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  alive: boolean
}

interface Enemy extends Entity {
  hp: number
  maxHp: number
  type: 'drone' | 'sentinel' | 'hunter'
  fireCd: number
  angle: number
}

interface Bullet extends Entity {
  fromPlayer: boolean
  dmg: number
  life: number
}

interface Pickup extends Entity {
  kind: 'data' | 'shield' | 'energy' | 'upgrade'
}

interface Hazard extends Entity {
  pulse: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

interface Objective {
  id: string
  label: string
  done: boolean
}

const WORLD = 3200
const STORAGE_KEY = 'nexus-zero-highscore'

export class LastSignalEngine {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  phase: GamePhase = 'playing'
  private raf = 0
  private last = 0
  private keys = new Set<string>()
  private mouse = { x: 0, y: 0, down: false }
  private cam: Vec = { x: 0, y: 0 }

  player = {
    x: WORLD / 2,
    y: WORLD / 2,
    vx: 0,
    vy: 0,
    angle: 0,
    r: 14,
    hull: 100,
    shields: 100,
    energy: 100,
    fireCd: 0,
    speedMul: 1,
    damageMul: 1,
  }

  enemies: Enemy[] = []
  bullets: Bullet[] = []
  pickups: Pickup[] = []
  hazards: Hazard[] = []
  particles: Particle[] = []
  stars: { x: number; y: number; z: number }[] = []

  signalNodes: { x: number; y: number; scanned: boolean; r: number }[] = []
  core: { x: number; y: number; r: number; unlocked: boolean } = {
    x: 0,
    y: 0,
    r: 40,
    unlocked: false,
  }

  objectives: Objective[] = [
    { id: 'scan', label: 'Scan 3 signal beacons', done: false },
    { id: 'data', label: 'Recover 5 data fragments', done: false },
    { id: 'core', label: 'Reach the alien megastructure core', done: false },
  ]

  score = 0
  kills = 0
  dataFragments = 0
  upgrades = 0
  timeAlive = 0
  wave = 0
  message = 'UNKNOWN SIGNAL DETECTED — FOLLOW THE BEACONS'
  messageTimer = 4

  onStats?: (s: Partial<GameStats> & { phase: GamePhase; objectives: Objective[] }) => void
  onMessage?: (msg: string) => void

  private boundKeyDown: (e: KeyboardEvent) => void
  private boundKeyUp: (e: KeyboardEvent) => void
  private boundMouseMove: (e: MouseEvent) => void
  private boundMouseDown: (e: MouseEvent) => void
  private boundMouseUp: (e: MouseEvent) => void
  private boundBlur: () => void

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('2D context unavailable')
    this.ctx = ctx

    this.boundKeyDown = (e) => {
      this.keys.add(e.code)
      if (e.code === 'Escape' && this.phase === 'playing') this.pause()
      else if (e.code === 'Escape' && this.phase === 'paused') this.resume()
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault()
      }
    }
    this.boundKeyUp = (e) => this.keys.delete(e.code)
    this.boundMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * canvas.width
      this.mouse.y = ((e.clientY - rect.top) / rect.height) * canvas.height
    }
    this.boundMouseDown = () => {
      this.mouse.down = true
    }
    this.boundMouseUp = () => {
      this.mouse.down = false
    }
    this.boundBlur = () => {
      this.keys.clear()
      this.mouse.down = false
      if (this.phase === 'playing') this.pause()
    }

    window.addEventListener('keydown', this.boundKeyDown)
    window.addEventListener('keyup', this.boundKeyUp)
    canvas.addEventListener('mousemove', this.boundMouseMove)
    canvas.addEventListener('mousedown', this.boundMouseDown)
    window.addEventListener('mouseup', this.boundMouseUp)
    window.addEventListener('blur', this.boundBlur)

    this.initWorld()
  }

  private initWorld() {
    for (let i = 0; i < 220; i++) {
      this.stars.push({
        x: Math.random() * WORLD,
        y: Math.random() * WORLD,
        z: Math.random(),
      })
    }

    // Signal beacons around the map
    const angles = [0.4, 2.1, 3.8, 5.2]
    angles.slice(0, 3).forEach((a, i) => {
      const dist = 520 + i * 80
      this.signalNodes.push({
        x: WORLD / 2 + Math.cos(a) * dist,
        y: WORLD / 2 + Math.sin(a) * dist,
        scanned: false,
        r: 36,
      })
    })

    this.core = {
      x: WORLD / 2 + 900,
      y: WORLD / 2 - 700,
      r: 48,
      unlocked: false,
    }

    // Hazards — anomaly fields
    for (let i = 0; i < 8; i++) {
      this.hazards.push({
        x: 200 + Math.random() * (WORLD - 400),
        y: 200 + Math.random() * (WORLD - 400),
        vx: 0,
        vy: 0,
        r: 50 + Math.random() * 40,
        alive: true,
        pulse: Math.random() * Math.PI * 2,
      })
    }

    // Initial pickups
    for (let i = 0; i < 12; i++) this.spawnPickup()

    this.spawnWave(1)
  }

  private spawnPickup(kind?: Pickup['kind']) {
    const kinds: Pickup['kind'][] = ['data', 'data', 'shield', 'energy', 'upgrade']
    const k = kind ?? kinds[Math.floor(Math.random() * kinds.length)]
    let x = 0
    let y = 0
    let tries = 0
    do {
      x = 150 + Math.random() * (WORLD - 300)
      y = 150 + Math.random() * (WORLD - 300)
      tries++
    } while (Math.hypot(x - this.player.x, y - this.player.y) < 200 && tries < 20)

    this.pickups.push({ x, y, vx: 0, vy: 0, r: 10, alive: true, kind: k })
  }

  private spawnWave(n: number) {
    this.wave = n
    const count = 3 + n * 2
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = 450 + Math.random() * 350
      const typeRoll = Math.random()
      const type: Enemy['type'] =
        n >= 3 && typeRoll > 0.75 ? 'hunter' : typeRoll > 0.45 ? 'sentinel' : 'drone'
      const hp = type === 'hunter' ? 60 : type === 'sentinel' ? 40 : 22
      this.enemies.push({
        x: this.player.x + Math.cos(angle) * dist,
        y: this.player.y + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        r: type === 'hunter' ? 18 : type === 'sentinel' ? 15 : 11,
        alive: true,
        hp,
        maxHp: hp,
        type,
        fireCd: 0.5 + Math.random(),
        angle: 0,
      })
    }
    this.pushMessage(`HOSTILE SIGNATURES — WAVE ${n}`)
    if (n > 1) sound.alarm()
  }

  private pushMessage(msg: string) {
    this.message = msg
    this.messageTimer = 3.5
    this.onMessage?.(msg)
  }

  private burst(x: number, y: number, color: string, n = 12) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const sp = 40 + Math.random() * 160
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 0.3 + Math.random() * 0.5,
        maxLife: 0.8,
        color,
        size: 1 + Math.random() * 3,
      })
    }
  }

  start() {
    this.last = performance.now()
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - this.last) / 1000)
      this.last = t
      if (this.phase === 'playing') this.update(dt)
      this.draw()
      this.raf = requestAnimationFrame(loop)
    }
    this.raf = requestAnimationFrame(loop)
    this.emit()
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    window.removeEventListener('keydown', this.boundKeyDown)
    window.removeEventListener('keyup', this.boundKeyUp)
    this.canvas.removeEventListener('mousemove', this.boundMouseMove)
    this.canvas.removeEventListener('mousedown', this.boundMouseDown)
    window.removeEventListener('mouseup', this.boundMouseUp)
    window.removeEventListener('blur', this.boundBlur)
  }

  pause() {
    if (this.phase !== 'playing') return
    this.phase = 'paused'
    this.emit()
  }

  resume() {
    if (this.phase !== 'paused') return
    this.phase = 'playing'
    this.last = performance.now()
    this.emit()
  }

  restart() {
    this.enemies = []
    this.bullets = []
    this.pickups = []
    this.hazards = []
    this.particles = []
    this.stars = []
    this.signalNodes = []
    this.score = 0
    this.kills = 0
    this.dataFragments = 0
    this.upgrades = 0
    this.timeAlive = 0
    this.wave = 0
    this.player = {
      x: WORLD / 2,
      y: WORLD / 2,
      vx: 0,
      vy: 0,
      angle: 0,
      r: 14,
      hull: 100,
      shields: 100,
      energy: 100,
      fireCd: 0,
      speedMul: 1,
      damageMul: 1,
    }
    this.objectives = [
      { id: 'scan', label: 'Scan 3 signal beacons', done: false },
      { id: 'data', label: 'Recover 5 data fragments', done: false },
      { id: 'core', label: 'Reach the alien megastructure core', done: false },
    ]
    this.phase = 'playing'
    this.initWorld()
    this.last = performance.now()
    this.pushMessage('MISSION REINITIALIZED')
    this.emit()
  }

  private emit() {
    this.onStats?.({
      score: this.score,
      kills: this.kills,
      dataFragments: this.dataFragments,
      upgrades: this.upgrades,
      timeAlive: this.timeAlive,
      won: this.phase === 'won',
      phase: this.phase,
      objectives: this.objectives,
    })
  }

  private update(dt: number) {
    this.timeAlive += dt
    if (this.messageTimer > 0) this.messageTimer -= dt

    const p = this.player
    const accel = 320 * p.speedMul
    let ax = 0
    let ay = 0
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) ay -= 1
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) ay += 1
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) ax -= 1
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) ax += 1
    if (ax || ay) {
      const len = Math.hypot(ax, ay) || 1
      p.vx += (ax / len) * accel * dt
      p.vy += (ay / len) * accel * dt
      p.energy = Math.max(0, p.energy - 3 * dt)
    }

    // Aim toward mouse in world space
    const aimX = this.mouse.x + this.cam.x
    const aimY = this.mouse.y + this.cam.y
    p.angle = Math.atan2(aimY - p.y, aimX - p.x)

    // Drag
    p.vx *= Math.pow(0.015, dt)
    p.vy *= Math.pow(0.015, dt)
    const maxSp = 280 * p.speedMul
    const sp = Math.hypot(p.vx, p.vy)
    if (sp > maxSp) {
      p.vx = (p.vx / sp) * maxSp
      p.vy = (p.vy / sp) * maxSp
    }

    p.x = Math.max(40, Math.min(WORLD - 40, p.x + p.vx * dt))
    p.y = Math.max(40, Math.min(WORLD - 40, p.y + p.vy * dt))

    // Energy regen slowly when idle
    if (!ax && !ay) p.energy = Math.min(100, p.energy + 8 * dt)
    p.shields = Math.min(100, p.shields + 2.5 * dt)

    p.fireCd = Math.max(0, p.fireCd - dt)
    if ((this.mouse.down || this.keys.has('Space')) && p.fireCd <= 0 && p.energy > 4) {
      this.firePlayer()
      p.fireCd = 0.16
      p.energy -= 4
    }

    // Beacons
    let scanned = 0
    for (const node of this.signalNodes) {
      if (node.scanned) {
        scanned++
        continue
      }
      if (Math.hypot(node.x - p.x, node.y - p.y) < node.r + p.r) {
        node.scanned = true
        scanned++
        this.score += 500
        sound.confirm()
        this.burst(node.x, node.y, '#00f0ff', 24)
        this.pushMessage(`BEACON ${scanned}/3 SYNCHRONIZED`)
      }
    }
    if (scanned >= 3 && !this.objectives[0].done) {
      this.objectives[0].done = true
      this.core.unlocked = true
      this.pushMessage('MEGASTRUCTURE CORE COORDINATES UNLOCKED')
      sound.charge()
    }

    // Core win
    if (
      this.core.unlocked &&
      this.objectives[1].done &&
      Math.hypot(this.core.x - p.x, this.core.y - p.y) < this.core.r + p.r
    ) {
      this.objectives[2].done = true
      this.win()
      return
    }

    // Hazards
    for (const h of this.hazards) {
      h.pulse += dt * 2
      const d = Math.hypot(h.x - p.x, h.y - p.y)
      if (d < h.r + p.r) {
        this.damagePlayer(12 * dt)
      }
    }

    // Pickups
    for (const pk of this.pickups) {
      if (!pk.alive) continue
      if (Math.hypot(pk.x - p.x, pk.y - p.y) < pk.r + p.r + 4) {
        pk.alive = false
        sound.pickup()
        this.burst(pk.x, pk.y, '#7b2fff', 10)
        if (pk.kind === 'data') {
          this.dataFragments++
          this.score += 200
          if (this.dataFragments >= 5 && !this.objectives[1].done) {
            this.objectives[1].done = true
            this.pushMessage('DATA ARCHIVE COMPLETE — PROCEED TO CORE')
            sound.confirm()
          }
        } else if (pk.kind === 'shield') {
          p.shields = Math.min(100, p.shields + 35)
        } else if (pk.kind === 'energy') {
          p.energy = Math.min(100, p.energy + 40)
        } else if (pk.kind === 'upgrade') {
          this.upgrades++
          p.damageMul += 0.15
          p.speedMul += 0.08
          this.score += 150
          this.pushMessage('WEAPON SYSTEMS UPGRADED')
        }
      }
    }
    this.pickups = this.pickups.filter((pk) => pk.alive)
    if (this.pickups.length < 8) this.spawnPickup()

    // Enemies
    for (const e of this.enemies) {
      if (!e.alive) continue
      const dx = p.x - e.x
      const dy = p.y - e.y
      const dist = Math.hypot(dx, dy) || 1
      e.angle = Math.atan2(dy, dx)
      const speed = e.type === 'hunter' ? 170 : e.type === 'sentinel' ? 110 : 140
      e.vx = (dx / dist) * speed
      e.vy = (dy / dist) * speed
      // Orbits slightly for sentinels
      if (e.type === 'sentinel' && dist < 280) {
        e.vx += -dy / dist * 80
        e.vy += dx / dist * 80
      }
      e.x += e.vx * dt
      e.y += e.vy * dt

      e.fireCd -= dt
      const range = e.type === 'hunter' ? 420 : 360
      if (e.fireCd <= 0 && dist < range) {
        e.fireCd = e.type === 'hunter' ? 0.55 : e.type === 'sentinel' ? 0.9 : 1.1
        const spd = 260
        this.bullets.push({
          x: e.x,
          y: e.y,
          vx: Math.cos(e.angle) * spd,
          vy: Math.sin(e.angle) * spd,
          r: 3.5,
          alive: true,
          fromPlayer: false,
          dmg: e.type === 'hunter' ? 14 : 9,
          life: 2.2,
        })
      }

      if (dist < e.r + p.r) {
        this.damagePlayer(18 * dt)
      }
    }

    // Bullets
    for (const b of this.bullets) {
      if (!b.alive) continue
      b.x += b.vx * dt
      b.y += b.vy * dt
      b.life -= dt
      if (b.life <= 0) b.alive = false

      if (b.fromPlayer) {
        for (const e of this.enemies) {
          if (!e.alive) continue
          if (Math.hypot(e.x - b.x, e.y - b.y) < e.r + b.r) {
            b.alive = false
            e.hp -= b.dmg
            this.burst(b.x, b.y, '#00f0ff', 6)
            if (e.hp <= 0) {
              e.alive = false
              this.kills++
              this.score += e.type === 'hunter' ? 350 : e.type === 'sentinel' ? 200 : 100
              sound.hit()
              this.burst(e.x, e.y, '#ff2a4a', 20)
              if (Math.random() > 0.55) this.spawnPickup(Math.random() > 0.5 ? 'data' : 'energy')
            }
            break
          }
        }
      } else if (Math.hypot(p.x - b.x, p.y - b.y) < p.r + b.r) {
        b.alive = false
        this.damagePlayer(b.dmg)
        this.burst(b.x, b.y, '#ff2a4a', 8)
      }
    }
    this.bullets = this.bullets.filter((b) => b.alive)
    this.enemies = this.enemies.filter((e) => e.alive)

    if (this.enemies.length === 0) {
      this.spawnWave(this.wave + 1)
    }

    // Particles
    for (const pt of this.particles) {
      pt.x += pt.vx * dt
      pt.y += pt.vy * dt
      pt.life -= dt
      pt.vx *= 0.96
      pt.vy *= 0.96
    }
    this.particles = this.particles.filter((pt) => pt.life > 0)

    // Camera
    this.cam.x = p.x - this.canvas.width / 2
    this.cam.y = p.y - this.canvas.height / 2

    if (p.hull <= 0) this.lose()
    this.emit()
  }

  private firePlayer() {
    const p = this.player
    const spd = 520
    const spread = 0.06
    for (let i = -1; i <= 1; i += 2) {
      // dual stream slightly
      const a = p.angle + i * 0.04
      this.bullets.push({
        x: p.x + Math.cos(p.angle) * 16,
        y: p.y + Math.sin(p.angle) * 16,
        vx: Math.cos(a + (Math.random() - 0.5) * spread) * spd,
        vy: Math.sin(a + (Math.random() - 0.5) * spread) * spd,
        r: 3,
        alive: true,
        fromPlayer: true,
        dmg: 12 * p.damageMul,
        life: 1.1,
      })
    }
    sound.laser()
  }

  private damagePlayer(amount: number) {
    const p = this.player
    let rem = amount
    if (p.shields > 0) {
      const abs = Math.min(p.shields, rem)
      p.shields -= abs
      rem -= abs
    }
    if (rem > 0) {
      p.hull -= rem
      if (Math.random() > 0.85) sound.hit()
    }
  }

  private win() {
    this.phase = 'won'
    this.score += 2000 + Math.floor(this.player.hull * 5)
    sound.victory()
    this.saveHighScore()
    this.emit()
  }

  private lose() {
    this.phase = 'lost'
    sound.defeat()
    this.saveHighScore()
    this.emit()
  }

  private saveHighScore() {
    try {
      const prev = Number(localStorage.getItem(STORAGE_KEY) || '0')
      if (this.score > prev) localStorage.setItem(STORAGE_KEY, String(this.score))
      localStorage.setItem(
        'nexus-zero-progress',
        JSON.stringify({
          bestScore: Math.max(prev, this.score),
          dataFragments: this.dataFragments,
          lastPlayed: new Date().toISOString(),
          completed: this.phase === 'won',
        }),
      )
    } catch {
      /* ignore */
    }
  }

  static getHighScore(): number {
    try {
      return Number(localStorage.getItem(STORAGE_KEY) || '0')
    } catch {
      return 0
    }
  }

  private draw() {
    const { ctx, canvas } = this
    const w = canvas.width
    const h = canvas.height
    ctx.fillStyle = '#030508'
    ctx.fillRect(0, 0, w, h)

    // Nebula wash
    const grd = ctx.createRadialGradient(w * 0.3, h * 0.2, 0, w * 0.3, h * 0.2, w * 0.7)
    grd.addColorStop(0, 'rgba(123, 47, 255, 0.12)')
    grd.addColorStop(1, 'transparent')
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, w, h)
    const grd2 = ctx.createRadialGradient(w * 0.8, h * 0.7, 0, w * 0.8, h * 0.7, w * 0.5)
    grd2.addColorStop(0, 'rgba(0, 240, 255, 0.06)')
    grd2.addColorStop(1, 'transparent')
    ctx.fillStyle = grd2
    ctx.fillRect(0, 0, w, h)

    ctx.save()
    ctx.translate(-this.cam.x, -this.cam.y)

    // Stars
    for (const s of this.stars) {
      const alpha = 0.25 + s.z * 0.75
      ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`
      ctx.fillRect(s.x, s.y, 1 + s.z * 1.5, 1 + s.z * 1.5)
    }

    // Grid
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)'
    ctx.lineWidth = 1
    const grid = 120
    const x0 = Math.floor(this.cam.x / grid) * grid
    const y0 = Math.floor(this.cam.y / grid) * grid
    for (let x = x0; x < this.cam.x + w + grid; x += grid) {
      ctx.beginPath()
      ctx.moveTo(x, this.cam.y)
      ctx.lineTo(x, this.cam.y + h)
      ctx.stroke()
    }
    for (let y = y0; y < this.cam.y + h + grid; y += grid) {
      ctx.beginPath()
      ctx.moveTo(this.cam.x, y)
      ctx.lineTo(this.cam.x + w, y)
      ctx.stroke()
    }

    // Hazards
    for (const hz of this.hazards) {
      const pulse = 0.35 + Math.sin(hz.pulse) * 0.15
      ctx.beginPath()
      ctx.arc(hz.x, hz.y, hz.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 42, 74, ${pulse * 0.25})`
      ctx.fill()
      ctx.strokeStyle = `rgba(255, 42, 74, ${pulse})`
      ctx.stroke()
    }

    // Core
    {
      const c = this.core
      const glow = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r * 2.5)
      glow.addColorStop(0, c.unlocked ? 'rgba(123, 47, 255, 0.55)' : 'rgba(80, 80, 100, 0.25)')
      glow.addColorStop(1, 'transparent')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(c.x, c.y, c.r * 2.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = c.unlocked ? '#7b2fff' : 'rgba(120,120,140,0.4)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2)
      ctx.stroke()
      // geometric structure
      ctx.save()
      ctx.translate(c.x, c.y)
      ctx.rotate(this.timeAlive * 0.3)
      for (let i = 0; i < 6; i++) {
        ctx.rotate(Math.PI / 3)
        ctx.strokeStyle = c.unlocked ? 'rgba(0,240,255,0.5)' : 'rgba(100,100,120,0.3)'
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(0, -c.r)
        ctx.stroke()
      }
      ctx.restore()
    }

    // Beacons
    for (const node of this.signalNodes) {
      ctx.beginPath()
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2)
      ctx.strokeStyle = node.scanned ? '#00f0ff' : 'rgba(0, 240, 255, 0.45)'
      ctx.lineWidth = 2
      ctx.stroke()
      if (!node.scanned) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.r + 8 + Math.sin(this.timeAlive * 3) * 4, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)'
        ctx.stroke()
      }
      ctx.fillStyle = node.scanned ? '#00f0ff' : '#7b2fff'
      ctx.beginPath()
      ctx.arc(node.x, node.y, 5, 0, Math.PI * 2)
      ctx.fill()
    }

    // Pickups
    for (const pk of this.pickups) {
      const colors = {
        data: '#7b2fff',
        shield: '#00f0ff',
        energy: '#ffb020',
        upgrade: '#e8eef8',
      }
      ctx.fillStyle = colors[pk.kind]
      ctx.shadowColor = colors[pk.kind]
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.arc(pk.x, pk.y, pk.r * (0.85 + Math.sin(this.timeAlive * 4 + pk.x) * 0.15), 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
    }

    // Bullets
    for (const b of this.bullets) {
      ctx.fillStyle = b.fromPlayer ? '#00f0ff' : '#ff2a4a'
      ctx.shadowColor = ctx.fillStyle
      ctx.shadowBlur = 8
      ctx.beginPath()
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
    }

    // Enemies
    for (const e of this.enemies) {
      ctx.save()
      ctx.translate(e.x, e.y)
      ctx.rotate(e.angle)
      const col = e.type === 'hunter' ? '#ff2a4a' : e.type === 'sentinel' ? '#ff6b2a' : '#ff4a7a'
      ctx.strokeStyle = col
      ctx.fillStyle = 'rgba(255, 42, 74, 0.25)'
      ctx.lineWidth = 2
      ctx.beginPath()
      if (e.type === 'sentinel') {
        ctx.moveTo(14, 0)
        ctx.lineTo(-10, 10)
        ctx.lineTo(-4, 0)
        ctx.lineTo(-10, -10)
      } else if (e.type === 'hunter') {
        ctx.moveTo(16, 0)
        ctx.lineTo(-12, 12)
        ctx.lineTo(-6, 0)
        ctx.lineTo(-12, -12)
      } else {
        ctx.moveTo(12, 0)
        ctx.lineTo(-8, 8)
        ctx.lineTo(-8, -8)
      }
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      ctx.restore()
      // HP bar
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(e.x - 12, e.y - e.r - 10, 24, 3)
      ctx.fillStyle = col
      ctx.fillRect(e.x - 12, e.y - e.r - 10, 24 * (e.hp / e.maxHp), 3)
    }

    // Player ship
    {
      const p = this.player
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.angle)
      // engine glow
      ctx.fillStyle = 'rgba(0, 240, 255, 0.5)'
      ctx.beginPath()
      ctx.moveTo(-12, -4)
      ctx.lineTo(-18 - Math.random() * 6, 0)
      ctx.lineTo(-12, 4)
      ctx.fill()
      ctx.strokeStyle = '#00f0ff'
      ctx.fillStyle = 'rgba(0, 240, 255, 0.2)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(16, 0)
      ctx.lineTo(-12, 11)
      ctx.lineTo(-6, 0)
      ctx.lineTo(-12, -11)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = '#e8eef8'
      ctx.beginPath()
      ctx.arc(2, 0, 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // shield ring
      if (p.shields > 5) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r + 8, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(0, 240, 255, ${0.15 + (p.shields / 100) * 0.35})`
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    }

    // Particles
    for (const pt of this.particles) {
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife)
      ctx.fillStyle = pt.color
      ctx.fillRect(pt.x, pt.y, pt.size, pt.size)
      ctx.globalAlpha = 1
    }

    // Minimap markers for objectives off-screen
    ctx.restore()

    // Message
    if (this.messageTimer > 0) {
      ctx.fillStyle = `rgba(0, 240, 255, ${Math.min(1, this.messageTimer)})`
      ctx.font = '12px "Share Tech Mono", monospace'
      ctx.textAlign = 'center'
      ctx.fillText(this.message, w / 2, 48)
    }

    // Edge objective indicators
    this.drawEdgeMarkers()
  }

  private drawEdgeMarkers() {
    const { ctx, canvas } = this
    const targets: { x: number; y: number; color: string }[] = []
    for (const n of this.signalNodes) {
      if (!n.scanned) targets.push({ x: n.x, y: n.y, color: '#00f0ff' })
    }
    if (this.core.unlocked && !this.objectives[2].done) {
      targets.push({ x: this.core.x, y: this.core.y, color: '#7b2fff' })
    }
    for (const t of targets) {
      const sx = t.x - this.cam.x
      const sy = t.y - this.cam.y
      if (sx > 40 && sx < canvas.width - 40 && sy > 40 && sy < canvas.height - 40) continue
      const cx = canvas.width / 2
      const cy = canvas.height / 2
      const dx = sx - cx
      const dy = sy - cy
      const ang = Math.atan2(dy, dx)
      const pad = 28
      const ex = Math.max(pad, Math.min(canvas.width - pad, cx + Math.cos(ang) * (cx - pad)))
      const ey = Math.max(pad, Math.min(canvas.height - pad, cy + Math.sin(ang) * (cy - pad)))
      // Better clamp along ray
      let mx = cx + Math.cos(ang) * 1000
      let my = cy + Math.sin(ang) * 1000
      const tX = dx !== 0 ? ((dx > 0 ? canvas.width - pad : pad) - cx) / dx : Infinity
      const tY = dy !== 0 ? ((dy > 0 ? canvas.height - pad : pad) - cy) / dy : Infinity
      const tEdge = Math.min(Math.abs(tX), Math.abs(tY))
      mx = cx + dx * tEdge
      my = cy + dy * tEdge
      ctx.fillStyle = t.color
      ctx.beginPath()
      ctx.save()
      ctx.translate(mx || ex, my || ey)
      ctx.rotate(ang)
      ctx.moveTo(8, 0)
      ctx.lineTo(-4, 5)
      ctx.lineTo(-4, -5)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }
  }

  resize(width: number, height: number) {
    this.canvas.width = width
    this.canvas.height = height
  }
}
