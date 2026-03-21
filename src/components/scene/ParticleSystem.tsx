import { useEffect, useRef, useCallback } from 'react'

interface ParticleSystemProps {
  type: 'snow' | 'light' | 'petal' | 'mist' | 'sparkle'
  width: number
  height: number
}

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  color: string
}

export default function ParticleSystem({ type, width, height }: ParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()

  // 初始化粒子
  const initParticles = useCallback(() => {
    const particleCount = type === 'mist' ? 30 : 50
    const particles: Particle[] = []

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle(type, width, height))
    }

    particlesRef.current = particles
  }, [type, width, height])

  // 创建单个粒子
  const createParticle = (type: string, w: number, h: number): Particle => {
    const colors: Record<string, string[]> = {
      snow: ['rgba(255, 255, 255, 0.8)', 'rgba(200, 220, 255, 0.6)'],
      light: ['rgba(255, 215, 0, 0.4)', 'rgba(255, 255, 200, 0.3)'],
      petal: ['rgba(255, 182, 193, 0.6)', 'rgba(255, 218, 185, 0.5)'],
      mist: ['rgba(200, 230, 255, 0.2)', 'rgba(180, 220, 240, 0.15)'],
      sparkle: ['rgba(255, 215, 0, 0.6)', 'rgba(200, 200, 200, 0.4)'],
    }

    const colorList = colors[type] || colors.snow

    return {
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * (type === 'snow' ? 0.5 : type === 'mist' ? 0.3 : 1),
      speedY: type === 'snow' ? Math.random() * 2 + 1 :
               type === 'mist' ? Math.random() * 0.5 - 0.25 :
               type === 'sparkle' ? 0 :
               Math.random() * 1 + 0.5,
      opacity: Math.random() * 0.5 + 0.3,
      color: colorList[Math.floor(Math.random() * colorList.length)],
    }
  }

  // 动画循环
  useEffect(() => {
    if (!canvasRef.current || width === 0 || height === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置画布尺寸
    canvas.width = width
    canvas.height = height

    // 初始化粒子
    initParticles()

    // 绘制函数
    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      particlesRef.current.forEach((particle) => {
        // 更新位置
        particle.x += particle.speedX
        particle.y += particle.speedY

        // 边界处理
        if (particle.y > height) {
          particle.y = -10
          particle.x = Math.random() * width
        }
        if (particle.x > width) {
          particle.x = 0
        } else if (particle.x < 0) {
          particle.x = width
        }

        // 闪烁效果（仅sparkle）
        if (type === 'sparkle') {
          particle.opacity += (Math.random() - 0.5) * 0.05
          particle.opacity = Math.max(0.2, Math.min(0.8, particle.opacity))
        }

        // 绘制粒子
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color.replace(/[\d.]+\)$/, `${particle.opacity})`)
        ctx.fill()

        // 光晕效果
        if (type === 'light' || type === 'sparkle') {
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2)
          ctx.fillStyle = particle.color.replace(/[\d.]+\)$/, `${particle.opacity * 0.3})`)
          ctx.fill()
        }
      })

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [type, width, height, initParticles])

  // 重新初始化当类型改变
  useEffect(() => {
    initParticles()
  }, [type, initParticles])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ width, height }}
    />
  )
}
