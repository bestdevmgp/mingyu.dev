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
    let marked: Element | null = null;

    const inheritsDefaultCursor = (element: Element) =>
      getComputedStyle(element).cursor === getComputedStyle(marked && marked.contains(element) ? marked : root).cursor;

    const textUnderPointer = () => {
      const caret = caretAt(x, y);
      if (!caret || !(caret.node instanceof Text)) return null;
      const text = caret.node;
      const parent = text.parentElement;
      if (!parent || !inheritsDefaultCursor(parent) || !isSelectable(parent)) return null;
      for (const start of [caret.offset - 1, caret.offset]) {
        if (start < 0 || start >= text.length) continue;
        range.setStart(text, start);
        range.setEnd(text, start + 1);
        for (const rect of range.getClientRects()) {
          if (x >= rect.left && x < rect.right && y >= rect.top && y < rect.bottom) return parent;
        }
      }
      return null;
    };

    const mark = (element: Element | null) => {
      if (element === marked) return;
      marked?.removeAttribute("data-text-cursor");
      element?.setAttribute("data-text-cursor", "");
      marked = element;
    };

    const update = () => {
      queued = false;
      if (selecting) return;
      mark(x >= 0 ? textUnderPointer() : null);
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
      if (selecting) root.classList.add("text-selecting");
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
      root.classList.remove("text-selecting");
      schedule();
    };

    const onLeave = (event: MouseEvent) => {
      if (event.relatedTarget) return;
      x = -1;
      schedule();
    };

    const changes = new MutationObserver(schedule);
    changes.observe(document.body, { childList: true, characterData: true, subtree: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("scroll", schedule, { capture: true, passive: true });
    document.addEventListener("transitionend", schedule, true);
    document.addEventListener("animationend", schedule, true);
    document.addEventListener("load", schedule, true);
    document.addEventListener("selectstart", onSelectStart);
    document.addEventListener("mouseout", onLeave);
    return () => {
      changes.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("scroll", schedule, true);
      document.removeEventListener("transitionend", schedule, true);
      document.removeEventListener("animationend", schedule, true);
      document.removeEventListener("load", schedule, true);
      document.removeEventListener("selectstart", onSelectStart);
      document.removeEventListener("mouseout", onLeave);
      mark(null);
      root.classList.remove("text-selecting");
    };
  }, []);

  return null;
};

export default TextCursor;
