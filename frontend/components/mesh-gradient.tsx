"use client";

import { useEffect, useRef } from "react";

export function MeshGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationId: number;
    let time = 0;

    const colors = [
      { r: 99, g: 102, b: 241 }, // indigo
      { r: 139, g: 92, b: 246 }, // purple
      { r: 236, g: 72, b: 153 }, // pink
      { r: 59, g: 130, b: 246 }, // blue
    ];

    function draw() {
      time += 0.005;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createRadialGradient(
        canvas.width / 2 + Math.sin(time) * 200,
        canvas.height / 2 + Math.cos(time) * 200,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) * 0.8
      );

      colors.forEach((color, i) => {
        const offset = i / colors.length;
        const animatedOffset = offset + Math.sin(time + i) * 0.1;
        gradient.addColorStop(
          Math.max(0, Math.min(1, animatedOffset)),
          `rgba(${color.r}, ${color.g}, ${color.b}, ${0.15 + Math.sin(time + i) * 0.1})`
        );
      });

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationId = requestAnimationFrame(draw);
    }

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-40 dark:opacity-20"
      style={{ mixBlendMode: "multiply" }}
    />
  );
}

