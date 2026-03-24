import { useRef, useEffect, useCallback } from 'react';

interface UseCanvasOptions {
  width: number;
  height: number;
  onRender: (ctx: CanvasRenderingContext2D, deltaTime: number) => void;
}

export const useCanvas = ({ width, height, onRender }: UseCanvasOptions) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const render = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    ctx.clearRect(0, 0, width, height);
    onRender(ctx, deltaTime);

    animationRef.current = requestAnimationFrame(render);
  }, [width, height, onRender]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationRef.current);
  }, [render]);

  return canvasRef;
};
