'use client';

import { useState, useEffect } from 'react';

interface RippleProps {
  color?: string;
  duration?: number;
}

interface RippleStyle {
  left: number;
  top: number;
  width: number;
  height: number;
  opacity: number;
}

export function RippleEffect({ color = 'rgba(255, 255, 255, 0.3)', duration = 600 }: RippleProps) {
  const [ripples, setRipples] = useState<RippleStyle[]>([]);

  useEffect(() => {
    // Cleanup ripples after animation completes
    const timer = setTimeout(() => {
      if (ripples.length > 0) {
        setRipples([]);
      }
    }, duration + 100);

    return () => clearTimeout(timer);
  }, [ripples, duration]);

  const addRipple = (event: React.MouseEvent<HTMLDivElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    
    // Calculate ripple size (use the larger dimension of the button)
    const size = Math.max(rect.width, rect.height) * 2;
    
    // Calculate ripple position
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    // Create new ripple
    const newRipple: RippleStyle = {
      left: x,
      top: y,
      width: size,
      height: size,
      opacity: 1,
    };
    
    // Add new ripple to state
    setRipples([...ripples, newRipple]);
  };

  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none"
      onClick={addRipple}
    >
      {ripples.map((ripple, index) => (
        <span
          key={index}
          className="absolute rounded-full animate-ripple"
          style={{
            left: ripple.left,
            top: ripple.top,
            width: ripple.width,
            height: ripple.height,
            backgroundColor: color,
            animationDuration: `${duration}ms`,
          }}
        />
      ))}
    </div>
  );
}
