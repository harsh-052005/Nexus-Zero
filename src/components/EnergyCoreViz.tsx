import { useEffect, useRef } from 'react'

export function EnergyCoreViz({ intensity = 0.7 }: { intensity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf = 0
    let t = 0

    const resize = () => {
      canvas.width = canvas.clientWidth * devicePixelRatio
      canvas.height = canvas.clientHeight * devicePixelRatio
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const draw = () => {
      t += 0.04
      const w = canvas.width
      const h = canvas.height
      const cx = w / 2
      const cy = h / 2
      ctx.clearRect(0, 0, w, h)

      for (let i = 0; i < 3; i++) {
        const amp = (8 + i * 6) * intensity * devicePixelRatio
        ctx.beginPath()
        for (let x = 0; x <= w; x += 2) {
          const y =
            cy +
            Math.sin(x * 0.02 + t * (1.2 + i * 0.3) + i) * amp +
            Math.sin(x * 0.05 - t * 2 + i * 2) * amp * 0.35
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.strokeStyle =
          i === 0
            ? `rgba(0, 240, 255, ${0.7 * intensity})`
            : i === 1
              ? `rgba(123, 47, 255, ${0.5 * intensity})`
              : `rgba(255, 42, 74, ${0.25 * intensity})`
        ctx.lineWidth = (2 - i * 0.4) * devicePixelRatio
        ctx.stroke()
      }

      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, h * 0.45)
      glow.addColorStop(0, `rgba(0, 240, 255, ${0.2 * intensity})`)
      glow.addColorStop(1, 'transparent')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, w, h)

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [intensity])

  return (
    <div className="energy-viz">
      <canvas ref={ref} aria-hidden />
    </div>
  )
}
