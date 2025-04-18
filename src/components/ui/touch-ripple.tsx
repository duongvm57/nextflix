'use client';

import { useEffect, useState } from 'react';

interface TouchRippleProps {
  className?: string;
}

export function TouchRipple({ className = '' }: TouchRippleProps) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
  const [nextId, setNextId] = useState(0);

  useEffect(() => {
    const container = document.querySelector(`.${className.split(' ').join('.')}`);
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      // Calculate ripple size based on container dimensions
      const size = Math.max(rect.width, rect.height) * 2;
      
      // Add new ripple
      setRipples(prev => [...prev, { id: nextId, x, y, size }]);
      setNextId(prev => prev + 1);
      
      // Remove ripple after animation completes
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== nextId));
      }, 600);
    };

    container.addEventListener('touchstart', handleTouchStart);
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
    };
  }, [className, nextId]);

  return (
    <>
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="absolute rounded-full bg-white/20 animate-ripple pointer-events-none"
          style={{
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
    </>
  );
}
