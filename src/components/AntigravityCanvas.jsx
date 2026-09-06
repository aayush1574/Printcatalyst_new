import React, { useEffect, useRef } from 'react';

export default function AntigravityCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle nodes
    const particleCount = Math.min(Math.floor(window.innerWidth / 22), 65);
    const particles = [];
    const colors = ['rgba(99, 102, 241, ', 'rgba(6, 182, 212, ', 'rgba(168, 85, 247, '];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 800 + 200,
        baseSize: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4 - 0.15,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }

    let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let time = 0;
    const render = () => {
      time += 0.02;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Render connected neural constellation lines in 3D space
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Spatial mouse gravitational push
        const dx = p1.x - mouse.x;
        const dy = p1.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160) {
          const force = (160 - dist) / 160;
          p1.x += (dx / dist) * force * 1.2;
          p1.y += (dy / dist) * force * 1.2;
        }

        // Drift motion
        p1.x += p1.vx;
        p1.y += p1.vy;

        // Wrap around boundaries
        if (p1.x < -20) p1.x = width + 20;
        if (p1.x > width + 20) p1.x = -20;
        if (p1.y < -20) p1.y = height + 20;
        if (p1.y > height + 20) p1.y = -20;

        // Connect neighboring particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const distBetween = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (distBetween < 120) {
            const lineAlpha = (1 - distBetween / 120) * 0.16;
            ctx.strokeStyle = `rgba(99, 102, 241, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Draw particle node with glowing depth
        const pulse = Math.sin(time * p1.pulseSpeed * 50 + p1.pulseOffset) * 0.3 + 0.7;
        const currentAlpha = p1.alpha * pulse;
        const currentSize = p1.baseSize * (600 / p1.z) * pulse;

        ctx.beginPath();
        ctx.arc(p1.x, p1.y, Math.max(currentSize, 0.8), 0, Math.PI * 2);
        ctx.fillStyle = `${p1.color}${currentAlpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p1.color.replace('rgba(', 'rgb(').replace(/,\s*$/, ')');
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-60"
      style={{ willChange: 'transform' }}
    />
  );
}
