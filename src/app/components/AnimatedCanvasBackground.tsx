"use client";

import { useEffect, useRef } from "react";

type CanvasElement = {
  draw: (ctx: CanvasRenderingContext2D, t: number) => void;
};

export default function AnimatedCanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {

    // FROM: https://codepen.io/Munkkeli/pen/PqWBdP
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const elements: CanvasElement[] = [];

    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };

    resize();

    const presets = {
      o: (x: number, y: number, s: number, dx: number, dy: number): CanvasElement => ({
        x,
        y,
        r: 12 * s,
        w: 5 * s,
        dx,
        dy,
        draw(ctx, t) {
          this.x += this.dx;
          this.y += this.dy;

          ctx.beginPath();
          ctx.arc(
            this.x + Math.sin((50 + x + t / 10) / 100) * 3,
            this.y + Math.sin((45 + x + t / 10) / 100) * 4,
            this.r,
            0,
            2 * Math.PI,
            false,
          );
          ctx.lineWidth = this.w;
          ctx.strokeStyle = "#ddd";
          ctx.stroke();
        },
      }),
      x: (
        x: number,
        y: number,
        s: number,
        dx: number,
        dy: number,
        dr: number,
        r = 0,
      ): CanvasElement => ({
        x,
        y,
        s: 20 * s,
        w: 5 * s,
        r,
        dx,
        dy,
        dr,
        draw(ctx, t) {
          this.x += this.dx;
          this.y += this.dy;
          this.r += this.dr;

          const line = (
            x: number,
            y: number,
            tx: number,
            ty: number,
            c: string,
            o = 0,
          ) => {
            ctx.beginPath();
            ctx.moveTo(-o + (this.s / 2) * x, o + (this.s / 2) * y);
            ctx.lineTo(-o + (this.s / 2) * tx, o + (this.s / 2) * ty);
            ctx.lineWidth = this.w;
            ctx.strokeStyle = c;
            ctx.stroke();
          };

          ctx.save();

          ctx.translate(
            this.x + Math.sin((x + t / 10) / 100) * 5,
            this.y + Math.sin((10 + x + t / 10) / 100) * 2,
          );
          ctx.rotate((this.r * Math.PI) / 180);

          line(-1, -1, 1, 1, "#eee");
          line(1, -1, -1, 1, "#eee");

          ctx.restore();
        },
      }),
    };

    for (let x = 0; x < canvas.width; x += 1) {
      for (let y = 0; y < canvas.height; y += 1) {
        if (Math.round(Math.random() * 8000) === 1) {
          const s = (Math.random() * 5 + 1) / 10;
          if (Math.round(Math.random()) === 1) {
            elements.push(presets.o(x, y, s, 0, 0));
          } else {
            elements.push(
              presets.x(x, y, s, 0, 0, (Math.random() * 3 - 1) / 10, Math.random() * 360),
            );
          }
        }
      }
    }

    const onResize = () => {
      resize();
    };

    window.addEventListener("resize", onResize);

    const intervalId = window.setInterval(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const time = Date.now();
      for (const element of elements) {
        element.draw(ctx, time);
      }
    }, 10);

    return () => {
      window.removeEventListener("resize", onResize);
      window.clearInterval(intervalId);
    };
  }, []);

  return <canvas id="canvas" ref={canvasRef} aria-hidden="true" />;
}
