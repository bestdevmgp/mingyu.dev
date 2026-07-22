"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";

import cn from "classnames";
import Image from "next/image";

type Size = "xs" | "sm" | "md";
interface SkillItemProps {
  size?: Size;
  label: string;
  imageUrl: string;
  isActive?: boolean;
  // When true (skill / experience lists), tapping the icon toggles the name label
  // below it — the touch equivalent of the desktop hover. Left off for project
  // cards, where a tap should fall through to open the project modal instead.
  tappable?: boolean;
}

// Dispatched whenever a tappable item opens, so every other open one closes itself:
// only a single label is ever shown at a time.
const OPEN_EVENT = "skillitem:open";

// Whether the primary input can't hover (a touch device). Read via useSyncExternalStore
// so there's no setState-in-effect and it stays correct if the input capability changes.
const HOVER_NONE_QUERY = "(hover: none)";
const subscribeHoverNone = (onChange: () => void) => {
  const mql = window.matchMedia(HOVER_NONE_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
};
const getHoverNone = () => window.matchMedia(HOVER_NONE_QUERY).matches;

const SkillItem = ({ size = "md", label, imageUrl, isActive = true, tappable = false }: SkillItemProps) => {
  const isRawImage = imageUrl.includes("raw");
  // Single source of corner radius per size, shared by the box AND the raw image,
  // so background photos (TS/JS) round exactly like transparent icons instead of
  // looking rounder — especially at the smaller xs size used in project/experience.
  const rounded = size === "md" ? "rounded-lg" : "rounded-md";

  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  // Tap-to-toggle is for touch devices only. Hover-capable devices (desktop) keep the
  // pure CSS :hover behavior — the label shows while the pointer is over the icon and
  // hides the moment it leaves, whether you clicked or just hovered.
  const isTouch = useSyncExternalStore(subscribeHoverNone, getHoverNone, () => false);
  const canTap = tappable && isActive && isTouch;

  useEffect(() => {
    if (!open) return;

    const close = () => setOpen(false);
    const onOtherOpen = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== id) close();
    };
    // Any touch/click outside the icon dismisses it (tapping elsewhere, or the
    // touch that begins a scroll); a scroll or drag dismisses it too.
    const onPointerDown = (event: Event) => {
      if (!ref.current?.contains(event.target as Node)) close();
    };

    window.addEventListener(OPEN_EVENT, onOtherOpen);
    document.addEventListener("pointerdown", onPointerDown, true);
    // Capture on window (the root of every event path) so scrolling inside a scroll
    // container — e.g. the project modal's own scroll area — dismisses it too, not
    // just page scroll (scroll events don't bubble).
    window.addEventListener("scroll", close, { capture: true, passive: true });
    window.addEventListener("touchmove", close, { passive: true });
    return () => {
      window.removeEventListener(OPEN_EVENT, onOtherOpen);
      document.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("touchmove", close);
    };
  }, [open, id]);

  const handleClick = (event: React.MouseEvent) => {
    if (!canTap) return;
    event.stopPropagation();
    if (open) {
      setOpen(false);
    } else {
      window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: id }));
      setOpen(true);
    }
  };

  return (
    <div
      ref={ref}
      onClick={canTap ? handleClick : undefined}
      className={cn(
        "relative group/skill transition-all shadow-xl hover:shadow-2xl flex items-center justify-center",
        rounded,
        isRawImage ? "p-0" : "bg-white border border-gray-100 p-1",
        canTap && "cursor-pointer",

        size === "md" && "w-12 h-12",
        size === "sm" && "w-9 h-9",
        size === "xs" && "w-7 h-7",
        !isActive && "opacity-15 blur-md",
      )}
    >
      <Image
        className={isRawImage ? cn("object-cover w-full h-full", rounded) : "object-contain"}
        width={size === "md" ? 36 : size === "sm" ? 34 : 26}
        height={size === "md" ? 36 : size === "sm" ? 34 : 26}
        src={imageUrl}
        alt={label}
      />
      <p
        className={cn(
          "absolute -bottom-1 translate-y-full left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-foreground/75 text-background rounded-sm text-xs md:text-sm text-center whitespace-nowrap font-normal z-10",
          open && isActive ? "visible" : cn("invisible", isActive && "group-hover/skill:visible"),
        )}
      >
        {label}
      </p>
    </div>
  );
};

export default SkillItem;
