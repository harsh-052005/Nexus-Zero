/**
 * Procedural Web Audio soundscape for NEXUS ZERO.
 * All sounds are generated — no external audio files required.
 */

type ToneOpts = {
  freq?: number
  freqEnd?: number
  type?: OscillatorType
  duration?: number
  gain?: number
  delay?: number
  attack?: number
  decay?: number
}

class SoundEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private ambientNodes: AudioNode[] = []
  private enabled = true
  private volume = 0.55
  private unlocked = false
  private ambientPlaying = false

  get isUnlocked() {
    return this.unlocked
  }

  get isEnabled() {
    return this.enabled
  }

  get masterVolume() {
    return this.volume
  }

  async unlock() {
    if (!this.ctx) {
      this.ctx = new AudioContext()
      this.master = this.ctx.createGain()
      this.master.gain.value = this.enabled ? this.volume : 0
      this.master.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume()
    }
    this.unlocked = true
  }

  setEnabled(on: boolean) {
    this.enabled = on
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(on ? this.volume : 0, this.ctx.currentTime, 0.05)
    }
    if (!on) this.stopAmbient()
    else if (this.unlocked) this.startAmbient()
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v))
    if (this.master && this.ctx && this.enabled) {
      this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05)
    }
  }

  private tone({
    freq = 440,
    freqEnd,
    type = 'sine',
    duration = 0.15,
    gain = 0.08,
    delay = 0,
    attack = 0.01,
    decay = 0.08,
  }: ToneOpts = {}) {
    if (!this.ctx || !this.master || !this.enabled || !this.unlocked) return
    const t0 = this.ctx.currentTime + delay
    const osc = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t0)
    if (freqEnd != null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), t0 + duration)
    }
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(gain, t0 + attack)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration - decay)
    osc.connect(g)
    g.connect(this.master)
    osc.start(t0)
    osc.stop(t0 + duration + 0.02)
  }

  private noiseBurst(duration = 0.12, gain = 0.04, filterFreq = 2000) {
    if (!this.ctx || !this.master || !this.enabled || !this.unlocked) return
    const len = Math.floor(this.ctx.sampleRate * duration)
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
    const src = this.ctx.createBufferSource()
    src.buffer = buffer
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = filterFreq
    const g = this.ctx.createGain()
    g.gain.value = gain
    src.connect(filter)
    filter.connect(g)
    g.connect(this.master)
    src.start()
  }

  click() {
    this.tone({ freq: 1800, freqEnd: 900, type: 'square', duration: 0.06, gain: 0.035 })
    this.noiseBurst(0.04, 0.02, 3200)
  }

  confirm() {
    this.tone({ freq: 520, type: 'triangle', duration: 0.12, gain: 0.06 })
    this.tone({ freq: 780, type: 'sine', duration: 0.18, gain: 0.04, delay: 0.06 })
  }

  deny() {
    this.tone({ freq: 180, freqEnd: 90, type: 'sawtooth', duration: 0.25, gain: 0.05 })
  }

  hover() {
    this.tone({ freq: 1200, type: 'sine', duration: 0.04, gain: 0.015 })
  }

  boot() {
    this.tone({ freq: 80, freqEnd: 240, type: 'sine', duration: 0.6, gain: 0.07 })
    this.tone({ freq: 400, freqEnd: 800, type: 'triangle', duration: 0.4, gain: 0.03, delay: 0.2 })
  }

  alarm() {
    for (let i = 0; i < 3; i++) {
      this.tone({
        freq: 880,
        type: 'square',
        duration: 0.12,
        gain: 0.05,
        delay: i * 0.18,
      })
    }
  }

  charge() {
    this.tone({ freq: 120, freqEnd: 900, type: 'sawtooth', duration: 0.8, gain: 0.045 })
    this.noiseBurst(0.5, 0.025, 800)
  }

  ignite() {
    this.noiseBurst(0.35, 0.08, 400)
    this.tone({ freq: 60, freqEnd: 180, type: 'sawtooth', duration: 0.7, gain: 0.09 })
    this.tone({ freq: 220, freqEnd: 440, type: 'triangle', duration: 0.5, gain: 0.04, delay: 0.15 })
  }

  laser() {
    this.tone({ freq: 1400, freqEnd: 280, type: 'square', duration: 0.12, gain: 0.04 })
  }

  hit() {
    this.noiseBurst(0.15, 0.07, 600)
    this.tone({ freq: 90, freqEnd: 40, type: 'sawtooth', duration: 0.2, gain: 0.06 })
  }

  pickup() {
    this.tone({ freq: 600, type: 'sine', duration: 0.1, gain: 0.05 })
    this.tone({ freq: 900, type: 'sine', duration: 0.12, gain: 0.04, delay: 0.08 })
    this.tone({ freq: 1200, type: 'triangle', duration: 0.15, gain: 0.03, delay: 0.16 })
  }

  victory() {
    const notes = [523, 659, 784, 1046]
    notes.forEach((f, i) => {
      this.tone({ freq: f, type: 'triangle', duration: 0.35, gain: 0.055, delay: i * 0.14 })
    })
  }

  defeat() {
    this.tone({ freq: 300, freqEnd: 60, type: 'sawtooth', duration: 1.2, gain: 0.07 })
    this.tone({ freq: 150, freqEnd: 40, type: 'sine', duration: 1.4, gain: 0.05, delay: 0.1 })
  }

  startAmbient() {
    if (!this.ctx || !this.master || !this.enabled || !this.unlocked || this.ambientPlaying) return
    this.ambientPlaying = true

    const makeDrone = (freq: number, type: OscillatorType, gain: number) => {
      const osc = this.ctx!.createOscillator()
      const g = this.ctx!.createGain()
      const lfo = this.ctx!.createOscillator()
      const lfoGain = this.ctx!.createGain()
      osc.type = type
      osc.frequency.value = freq
      lfo.frequency.value = 0.08 + Math.random() * 0.06
      lfoGain.gain.value = freq * 0.01
      lfo.connect(lfoGain)
      lfoGain.connect(osc.frequency)
      g.gain.value = gain
      osc.connect(g)
      g.connect(this.master!)
      osc.start()
      lfo.start()
      this.ambientNodes.push(osc, g, lfo, lfoGain)
    }

    makeDrone(42, 'sine', 0.028)
    makeDrone(63, 'triangle', 0.016)
    makeDrone(105, 'sine', 0.012)

    // Soft high shimmer
    const noiseLen = this.ctx.sampleRate * 4
    const buf = this.ctx.createBuffer(1, noiseLen, this.ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < noiseLen; i++) d[i] = (Math.random() * 2 - 1) * 0.15
    const src = this.ctx.createBufferSource()
    src.buffer = buf
    src.loop = true
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 4000
    const ng = this.ctx.createGain()
    ng.gain.value = 0.008
    src.connect(filter)
    filter.connect(ng)
    ng.connect(this.master)
    src.start()
    this.ambientNodes.push(src, filter, ng)
  }

  stopAmbient() {
    this.ambientNodes.forEach((n) => {
      try {
        if ('stop' in n && typeof (n as OscillatorNode).stop === 'function') {
          ;(n as OscillatorNode).stop()
        }
        n.disconnect()
      } catch {
        /* already stopped */
      }
    })
    this.ambientNodes = []
    this.ambientPlaying = false
  }
}

export const sound = new SoundEngine()
