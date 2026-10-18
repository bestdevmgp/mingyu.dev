"use client";

import { useEffect } from "react";

const caretAt = (x: number, y: number) => {
  if (document.caretPositionFromPoint) {
    const position = document.caretPositionFromPoint(x, y);
    return position && { node: position.offsetNode, offset: position.offset };
  }
  const range = document.caretRangeFromPoint?.(x, y);
  return range && { node: range.startContainer, offset: range.startOffset };
};

const inheritsDefaultCursor = (element: Element) =>
  getComputedStyle(element).cursor === getComputedStyle(document.documentElement).cursor;

const isSelectable = (element: Element) => {
  for (let node: Element | null = element; node; node = node.parentElement) {
    const style = getComputedStyle(node);
    const value = style.userSelect || style.webkitUserSelect;
    if (value === "none") return false;
    if (value && value !== "auto") return true;
  }
  return true;
};

const TextCursor = () => {
  useEffect(() => {
    const root = document.documentElement;
    const range = document.createRange();
    let x = -1;
    let y = -1;
    let queued = false;
    let pressed = false;
    let selecting = false;

    const overText = () => {
      const caret = caretAt(x, y);
      if (!caret || !(caret.node instanceof Text)) return false;
      const text = caret.node;
      const parent = text.parentElement;
      if (!parent || !inheritsDefaultCursor(parent) || !isSelectable(parent)) return false;
      for (const start of [caret.offset - 1, caret.offset]) {
        if (start < 0 || start >= text.length) continue;
        range.setStart(text, start);
        range.setEnd(text, start + 1);
        for (const rect of range.getClientRects()) {
          if (x >= rect.left && x < rect.right && y >= rect.top && y < rect.bottom) return true;
        }
      }
      return false;
    };

    const update = () => {
      queued = false;
      if (selecting) return;
      root.classList.toggle("over-text", x >= 0 && overText());
    };

    const schedule = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      x = event.clientX;
      y = event.clientY;
      if (selecting) root.classList.add("over-text");
      else schedule();
    };

    const onDown = (event: PointerEvent) => {
      pressed = event.pointerType !== "touch" && event.button === 0;
    };

    const onSelectStart = (event: Event) => {
      const target = event.target instanceof Element ? event.target : (event.target as Node | null)?.parentElement;
      if (pressed && target && inheritsDefaultCursor(target)) selecting = true;
    };

    const onUp = () => {
      pressed = false;
      if (!selecting) return;
      selecting = false;
      schedule();
    };

    const onLeave = (event: MouseEvent) => {
      if (event.relatedTarget) return;
      x = -1;
      schedule();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    document.addEventListener("selectstart", onSelectStart);
    document.addEventListener("mouseout", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("scroll", schedule);
      document.removeEventListener("selectstart", onSelectStart);
      document.removeEventListener("mouseout", onLeave);
      root.classList.remove("over-text");
    };
  }, []);

  return null;
};

export default TextCursor;
