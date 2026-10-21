import { useRef, useState } from "react";

export const TAP_SLOP = 10;

export default function useTouchPress() {
  const [isPressed, setIsPressed] = useState(false);
  const origin = useRef({ x: 0, y: 0 });

  const handlers = {
    onTouchStart: (event: React.TouchEvent) => {
      const touch = event.touches[0];
      origin.current = { x: touch.clientX, y: touch.clientY };
      setIsPressed(true);
    },
    onTouchMove: (event: React.TouchEvent) => {
      const touch = event.touches[0];
      const moved = Math.hypot(touch.clientX - origin.current.x, touch.clientY - origin.current.y);
      if (moved > TAP_SLOP) setIsPressed(false);
    },
    onTouchEnd: () => setIsPressed(false),
    onTouchCancel: () => setIsPressed(false),
  };

  return [isPressed, handlers] as const;
}
