import type { KeyboardEvent } from "react";

const arrowFocus = (selector: string) => (event: KeyboardEvent<HTMLElement>) => {
  const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(selector));
  const index = items.indexOf(document.activeElement as HTMLElement);
  const target = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: items.length - 1 }[event.key];
  if (target === undefined) return;
  event.preventDefault();
  items[(target + items.length) % items.length]?.focus();
};

export default arrowFocus;
