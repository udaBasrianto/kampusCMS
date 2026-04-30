import { useRef, useEffect } from "react";

export interface ParticleConfig {
  enabled: boolean;
  count: number;
  color: string;
  opacity: number;
  size_min: number;
  size_max: number;
  speed: number;
  line_linked: boolean;
  line_color: string;
  line_opacity: number;
  line_distance: number;
  direction: "none" | "top" | "bottom" | "left" | "right";
  shape: "circle" | "square" | "triangle" | "star";
  // Mouse interaction
  interact_hover: boolean;
  interact_mode: "repulse" | "attract" | "grab" | "bubble";
  interact_distance: number;
  interact_strength: number;
}

export const defaultParticleConfig: ParticleConfig = {
  enabled: false,
  count: 50,
  color: "#1e3a5f",
  opacity: 0.4,
  size_min: 1,
  size_max: 4,
  speed: 0.8,
  line_linked: true,
  line_color: "#1e3a5f",
  line_opacity: 0.15,
  line_distance: 150,
  direction: "none",
  shape: "circle",
  interact_hover: true,
  interact_mode: "grab",
  interact_distance: 180,
  interact_strength: 5,
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  opacity: number;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 30, g: 58, b: 95 };
}

function drawShape(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, shape: string) {
  switch (shape) {
    case "square":
      ctx.fillRect(x - size, y - size, size * 2, size * 2);
      break;
    case "triangle":
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x - size, y + size);
      ctx.lineTo(x + size, y + size);
      ctx.closePath();
      ctx.fill();
      break;
    case "star": {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const method = i === 0 ? "moveTo" : "lineTo";
        ctx[method](x + size * Math.cos(angle), y + size * Math.sin(angle));
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    default:
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
  }
}

export function HeroParticles({ config }: { config: ParticleConfig }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !config.enabled) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mouse tracking — attach to parent section, not canvas,
    // so interaction works even over text/buttons in the center
    const section = canvas.closest("section") || canvas.parentElement;
    if (!section) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };
    const onMouseLeave = () => {
      mouseRef.current.active = false;
    };
    // Touch support
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mouseRef.current.x = e.touches[0].clientX - rect.left;
        mouseRef.current.y = e.touches[0].clientY - rect.top;
        mouseRef.current.active = true;
      }
    };
    const onTouchEnd = () => {
      mouseRef.current.active = false;
    };

    section.addEventListener("mousemove", onMouseMove as EventListener);
    section.addEventListener("mouseleave", onMouseLeave as EventListener);
    section.addEventListener("touchmove", onTouchMove as EventListener, { passive: true });
    section.addEventListener("touchend", onTouchEnd as EventListener);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas.parentElement!);

    // Initialize particles
    const initParticles = () => {
      const count = Math.max(10, Math.min(200, config.count));
      particlesRef.current = [];
      for (let i = 0; i < count; i++) {
        const size = config.size_min + Math.random() * (config.size_max - config.size_min);
        let vx = (Math.random() - 0.5) * config.speed;
        let vy = (Math.random() - 0.5) * config.speed;

        switch (config.direction) {
          case "top": vy = -Math.abs(vy); break;
          case "bottom": vy = Math.abs(vy); break;
          case "left": vx = -Math.abs(vx); break;
          case "right": vx = Math.abs(vx); break;
        }

        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx,
          vy,
          size,
          baseSize: size,
          opacity: 0.3 + Math.random() * 0.7,
        });
      }
    };
    initParticles();

    const particleRgb = hexToRgb(config.color);
    const lineRgb = hexToRgb(config.line_color);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      const mouse = mouseRef.current;
      const hasInteract = config.interact_hover && mouse.active;
      const interactDist = config.interact_distance || 180;
      const strength = config.interact_strength || 5;

      // Update & draw particles
      for (const p of particles) {
        // Mouse interaction
        if (hasInteract) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < interactDist) {
            const factor = 1 - dist / interactDist;
            const force = factor * strength * 0.05;

            switch (config.interact_mode) {
              case "repulse": {
                // Push particles away from cursor
                const angle = Math.atan2(dy, dx);
                p.vx += Math.cos(angle) * force * 2;
                p.vy += Math.sin(angle) * force * 2;
                break;
              }
              case "attract": {
                // Pull particles toward cursor
                const angle = Math.atan2(dy, dx);
                p.vx -= Math.cos(angle) * force;
                p.vy -= Math.sin(angle) * force;
                break;
              }
              case "bubble": {
                // Enlarge particles near cursor
                p.size = p.baseSize + (p.baseSize * 2 * factor);
                break;
              }
              case "grab":
              default:
                // Grab mode: just draw lines (handled below)
                break;
            }
          } else {
            // Reset bubble size when out of range
            if (config.interact_mode === "bubble") {
              p.size += (p.baseSize - p.size) * 0.1;
            }
          }
        } else if (config.interact_mode === "bubble") {
          p.size += (p.baseSize - p.size) * 0.1;
        }

        // Apply velocity with damping
        p.x += p.vx;
        p.y += p.vy;

        // Damping for repulse/attract to prevent runaway
        if (config.interact_mode === "repulse" || config.interact_mode === "attract") {
          p.vx *= 0.98;
          p.vy *= 0.98;
          // Re-apply base direction drift
          const baseDrift = config.speed * 0.01;
          switch (config.direction) {
            case "top": p.vy -= baseDrift; break;
            case "bottom": p.vy += baseDrift; break;
            case "left": p.vx -= baseDrift; break;
            case "right": p.vx += baseDrift; break;
            default: break;
          }
        }

        // Wrap around edges
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        const alpha = config.opacity * p.opacity;
        ctx.fillStyle = `rgba(${particleRgb.r},${particleRgb.g},${particleRgb.b},${alpha})`;
        drawShape(ctx, p.x, p.y, p.size, config.shape);
      }

      // Draw lines between nearby particles
      if (config.line_linked) {
        const maxDist = config.line_distance;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < maxDist) {
              const alpha = config.line_opacity * (1 - dist / maxDist);
              ctx.strokeStyle = `rgba(${lineRgb.r},${lineRgb.g},${lineRgb.b},${alpha})`;
              ctx.lineWidth = 0.6;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      // Draw grab lines from cursor to nearby particles
      if (hasInteract && config.interact_mode === "grab") {
        for (const p of particles) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < interactDist) {
            const alpha = config.line_opacity * 2 * (1 - dist / interactDist);
            ctx.strokeStyle = `rgba(${particleRgb.r},${particleRgb.g},${particleRgb.b},${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      resizeObserver.disconnect();
      section.removeEventListener("mousemove", onMouseMove as EventListener);
      section.removeEventListener("mouseleave", onMouseLeave as EventListener);
      section.removeEventListener("touchmove", onTouchMove as EventListener);
      section.removeEventListener("touchend", onTouchEnd as EventListener);
    };
  }, [config]);

  if (!config.enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[1] pointer-events-none"
      style={{ mixBlendMode: "multiply" }}
    />
  );
}
