import { type RefObject, useEffect } from "react";

const TABBABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
const FOCUSABLE = "a[href], button, [tabindex]";
const POINTER_OPENER_WINDOW = 1000;

const scopes: HTMLElement[] = [];
let keyboardInput = false;
let pointerOpener: HTMLElement | null = null;
let pointerTime = 0;
let resumeLine: (() => number) | null = null;

const tabbables = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>(TABBABLE)).filter(
    element => element.getClientRects().length > 0 && !element.closest("[inert]"),
  );

const resumeTab = (event: KeyboardEvent) => {
  const line = resumeLine;
  if (event.key !== "Tab" || !line) return;
  resumeLine = null;
  const main = document.querySelector("main");
  if (!main || document.activeElement !== document.body) return;
  const top = line();
  const items = tabbables(main);
  const below = items.findIndex(element => element.getBoundingClientRect().top >= top);
  const target = event.shiftKey ? items[(below < 0 ? items.length : below) - 1] : items[below];
  if (!target) return;
  event.preventDefault();
  target.focus({ focusVisible: true });
};

if (typeof window !== "undefined") {
  window.addEventListener(
    "keydown",
    event => {
      keyboardInput = true;
      resumeTab(event);
    },
    true,
  );
  window.addEventListener(
    "pointerdown",
    event => {
      keyboardInput = false;
      resumeLine = null;
      pointerOpener = event.target instanceof Element ? event.target.closest<HTMLElement>(FOCUSABLE) : null;
      pointerTime = event.timeStamp;
    },
    true,
  );
}

const recentPointerOpener = () => (performance.now() - pointerTime < POINTER_OPENER_WINDOW ? pointerOpener : null);

function useFocusScope(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  initialFocus?: string,
  resumeBelow?: (openedByKeyboard: boolean) => (() => number) | null,
): void {
  useEffect(() => {
    const root = ref.current;
    if (!active || !root) return;

    const current = document.activeElement;
    const opener = current instanceof HTMLElement && current !== document.body ? current : recentPointerOpener();
    const openedByKeyboard = keyboardInput;
    scopes.push(root);
    ((initialFocus && root.querySelector<HTMLElement>(initialFocus)) || root).focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || scopes[scopes.length - 1] !== root) return;
      const items = tabbables(root);
      const focused = document.activeElement;
      if (!items.length) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (!focused || !root.contains(focused)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (
        event.shiftKey &&
        (focused === first || focused.compareDocumentPosition(first) & Node.DOCUMENT_POSITION_FOLLOWING)
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && focused === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      scopes.splice(scopes.indexOf(root), 1);
      const closedInside = keyboardInput || (pointerOpener !== null && root.contains(pointerOpener));
      const restore = () => {
        const focused = document.activeElement;
        if (focused && focused !== document.body && !root.contains(focused)) return;
        const line = closedInside ? resumeBelow?.(openedByKeyboard) : null;
        if (line) {
          if (focused instanceof HTMLElement) focused.blur();
          resumeLine = line;
          return;
        }
        if (!opener?.isConnected) return;
        opener.focus({ preventScroll: true, focusVisible: openedByKeyboard });
      };
      if (!openedByKeyboard && keyboardInput) setTimeout(restore);
      else restore();
    };
  }, [ref, active, initialFocus, resumeBelow]);
}

export default useFocusScope;
