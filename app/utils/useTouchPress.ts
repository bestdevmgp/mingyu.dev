import { useEffect, useRef, useState } from "react";

export const TAP_SLOP = 10;
const MIN_PRESS = 200;

export default function useTouchPress() {
  const [isPressed, setIsPressed] = useState(false);
  const origin = useRef({ x: 0, y: 0 });
  const pressedAt = useRef(0);
  const releaseTimer = useRef(0);

  useEffect(() => () => window.clearTimeout(releaseTimer.current), []);

  const release = () => {
    window.clearTimeout(releaseTimer.current);
    setIsPressed(false);
  };

  const handlers = {
    onTouchStart: (event: React.TouchEvent) => {
      const touch = event.touches[0];
      origin.current = { x: touch.clientX, y: touch.clientY };
      pressedAt.current = performance.now();
      window.clearTimeout(releaseTimer.current);
      setIsPressed(true);
    },
    onTouchMove: (event: React.TouchEvent) => {
      const touch = event.touches[0];
      const moved = Math.hypot(touch.clientX - origin.current.x, touch.clientY - origin.current.y);
      if (moved > TAP_SLOP) release();
    },
    onTouchEnd: () => {
      const wait = pressedAt.current + MIN_PRESS - performance.now();
      if (wait > 0) releaseTimer.current = window.setTimeout(() => setIsPressed(false), wait);
      else setIsPressed(false);
    },
    onTouchCancel: release,
  };

  return [isPressed, handlers] as const;
}
