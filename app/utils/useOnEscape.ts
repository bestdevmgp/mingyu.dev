import { useEffect } from "react";

function useOnEscape(active: boolean, handler: () => void): void {
  useEffect(() => {
    if (!active) return;
    const listener = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      handler();
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [active, handler]);
}

export default useOnEscape;
