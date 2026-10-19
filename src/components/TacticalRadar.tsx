import { useEffect, useRef } from 'react'

export function TacticalRadar({ active = true }: { active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const blips = useRef(
    Array.from({ length: 7 }, () => ({
      a: Math.random() * Math.PI * 2,
      d: 0.2 + Math.random() * 0.7,
      s: 0.2 + Math.random() * 0.5,
      life: Math.random(),
    })),
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf = 0
    let sweep = 0

    const resize = () => {
      const size = canvas.clientWidth * devicePixelRatio
      canvas.width = size
      canvas.height = size
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const draw = () => {
      const w = canvas.width
      const h = canvas.height
      const cx = w / 2
      const cy = h / 2
      const r = w * 0.42

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = 'rgba(0, 10, 18, 0.85)'
      ctx.beginPath()
      ctx.arc(cx, cy, r + 4, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)'
      ctx.lineWidth = 1 * devicePixelRatio
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath()
        ctx.arc(cx, cy, (r * i) / 4, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.beginPath()
      ctx.moveTo(cx - r, cy)
      ctx.lineTo(cx + r, cy)
      ctx.moveTo(cx, cy - r)
      ctx.lineTo(cx, cy + r)
      ctx.stroke()

      if (active) {
        sweep += 0.025
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(sweep)
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r)
        g.addColorStop(0, 'rgba(0, 240, 255, 0.35)')
        g.addColorStop(1, 'rgba(0, 240, 255, 0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.arc(0, 0, r, 0, Math.PI * 0.35)
        ctx.closePath()
        ctx.fill()
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)'
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(r, 0)
        ctx.stroke()
        ctx.restore()

        for (const b of blips.current) {
          b.a += b.s * 0.003
          b.life += 0.01
          const bx = cx + Math.cos(b.a) * b.d * r
          const by = cy + Math.sin(b.a) * b.d * r
          // Visible when sweep recently passed
          const diff = ((sweep - b.a) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)
          const alpha = diff < 1.2 ? 1 - diff / 1.2 : 0.08
          ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`
          ctx.shadowColor = '#00f0ff'
          ctx.shadowBlur = 8
          ctx.beginPath()
          ctx.arc(bx, by, 3 * devicePixelRatio, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
        }
      }

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)'
      ctx.strokeRect(2, 2, w - 4, h - 4)
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [active])

  return (
    <div className="radar-wrap">
      <canvas ref={canvasRef} aria-label="Tactical radar" />
    </div>
  )
}
