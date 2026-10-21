interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface FlipTransform {
  x: number;
  y: number;
  scale: number;
}

export const getVisibleImageBox = (image: HTMLImageElement): Box | null => {
  const rect = image.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;

  const natural = image.naturalWidth / image.naturalHeight;
  if (!Number.isFinite(natural) || natural <= 0) {
    return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
  }

  const boxRatio = rect.width / rect.height;
  const width = natural > boxRatio ? rect.width : rect.height * natural;
  const height = natural > boxRatio ? rect.width / natural : rect.height;

  return {
    left: rect.left + (rect.width - width) / 2,
    top: rect.top + (rect.height - height) / 2,
    width,
    height,
  };
};

export const getCenteredBox = (container: HTMLElement, size: { width: number; height: number }): Box => {
  const rect = container.getBoundingClientRect();
  return {
    left: rect.left + (rect.width - size.width) / 2,
    top: rect.top + (rect.height - size.height) / 2,
    width: size.width,
    height: size.height,
  };
};

const centerOf = (box: Box) => ({ x: box.left + box.width / 2, y: box.top + box.height / 2 });

export const getFlipTransform = (from: Box, to: Box, pivot = centerOf(to)): FlipTransform | null => {
  if (!to.width || !from.width) return null;
  const scale = from.width / to.width;
  const fromCenter = centerOf(from);
  const toCenter = centerOf(to);
  return {
    x: fromCenter.x - pivot.x - scale * (toCenter.x - pivot.x),
    y: fromCenter.y - pivot.y - scale * (toCenter.y - pivot.y),
    scale,
  };
};

const toCss = (transform: FlipTransform) => `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`;

const releaseAfterFlight = (element: HTMLElement) => {
  const done = (event: TransitionEvent) => {
    if (event.target !== element || event.propertyName !== "transform") return;
    element.style.willChange = "";
    element.removeEventListener("transitionend", done);
  };
  element.addEventListener("transitionend", done);
};

export const flipFrom = (element: HTMLElement, from: FlipTransform, duration: number, easing: string) => {
  element.style.willChange = "transform";
  element.style.transition = "none";
  element.style.transform = toCss(from);
  void element.offsetWidth;
  element.style.transition = `transform ${duration}ms ${easing}`;
  element.style.transform = "translate(0px, 0px) scale(1)";
  releaseAfterFlight(element);
};

export const flipTo = (element: HTMLElement, to: FlipTransform, duration: number, easing: string) => {
  element.style.willChange = "transform";
  element.style.transition = `transform ${duration}ms ${easing}`;
  element.style.transform = toCss(to);
  releaseAfterFlight(element);
};
