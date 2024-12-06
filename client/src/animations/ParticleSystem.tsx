import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface ParticleSystemProps {
  x: number;
  y: number;
  type: 'goal' | 'pass' | 'tackle' | 'shot';
  onComplete?: () => void;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({
  x,
  y,
  type,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();

  const getParticleConfig = (type: string) => {
    switch (type) {
      case 'goal':
        return {
          count: 100,
          colors: ['#DAA520', '#FFD700', '#FFA500'],
          size: { min: 2, max: 6 },
          speed: { min: 2, max: 8 },
          life: { min: 30, max: 60 },
        };
      case 'pass':
        return {
          count: 20,
          colors: ['#4169E1', '#1E90FF'],
          size: { min: 1, max: 3 },
          speed: { min: 1, max: 4 },
          life: { min: 15, max: 30 },
        };
      case 'tackle':
        return {
          count: 30,
          colors: ['#FF4500', '#FF6347'],
          size: { min: 2, max: 4 },
          speed: { min: 3, max: 6 },
          life: { min: 20, max: 40 },
        };
      case 'shot':
        return {
          count: 50,
          colors: ['#FF4500', '#FFD700', '#FFA500'],
          size: { min: 2, max: 5 },
          speed: { min: 2, max: 7 },
          life: { min: 25, max: 50 },
        };
      default:
        return {
          count: 30,
          colors: ['#DAA520'],
          size: { min: 2, max: 4 },
          speed: { min: 2, max: 5 },
          life: { min: 20, max: 40 },
        };
    }
  };

  const createParticles = () => {
    const config = getParticleConfig(type);
    const particles: Particle[] = [];

    for (let i = 0; i < config.count; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = config.speed.min + Math.random() * (config.speed.max - config.speed.min);
      
      particles.push({
        id: i,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: config.life.min + Math.random() * (config.life.max - config.life.min),
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        size: config.size.min + Math.random() * (config.size.max - config.size.min),
      });
    }

    return particles;
  };

  const updateParticles = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    particlesRef.current = particlesRef.current.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= 1;

      // Aplicar efecto de gravedad para algunos tipos
      if (type === 'goal' || type === 'shot') {
        particle.vy += 0.2;
      }

      // Dibujar partícula
      ctx.beginPath();
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.life / 50;
      
      if (type === 'goal') {
        // Partículas estrelladas para goles
        const spikes = 5;
        const outerRadius = particle.size;
        const innerRadius = particle.size / 2;

        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (i * Math.PI) / spikes;
          const px = particle.x + Math.cos(angle) * radius;
          const py = particle.y + Math.sin(angle) * radius;
          
          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
      } else {
        // Partículas circulares para otros eventos
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      }

      ctx.fill();
      ctx.globalAlpha = 1;

      return particle.life > 0;
    });

    if (particlesRef.current.length > 0) {
      animationFrameRef.current = requestAnimationFrame(() => updateParticles(ctx));
    } else {
      onComplete?.();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (canvas && ctx) {
      particlesRef.current = createParticles();
      updateParticles(ctx);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [x, y, type]);

  return (
    <motion.canvas
      ref={canvasRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute top-0 left-0 pointer-events-none"
      width={window.innerWidth}
      height={window.innerHeight}
    />
  );
};

export default ParticleSystem;
