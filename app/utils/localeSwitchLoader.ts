const MIN_VISIBLE = 300;
const FADE = 350;
const CAP = 5000;

let veil: HTMLElement | null = null;
let active = false;
let target = "";
let shownAt = 0;
let hideTimer = 0;
let cleanupTimer = 0;
let capTimer = 0;

// 언어를 바꾸면 서버 트리가 다시 그려지면서 원래 오버레이도 컴포넌트 상태도 모두 교체된다.
// 그래서 같은 모습의 사본을 직접 유지하고, 완료 여부는 문서의 언어 속성으로 판단한다.
const ensureVeil = () => {
  if (veil?.isConnected) return veil;
  const source = document.querySelector(".site-loader");
  if (!source) return null;
  veil = source.cloneNode(true) as HTMLElement;
  veil.classList.add("locale-veil");
  if (active) veil.classList.add("locale-veil-in");
  document.body.appendChild(veil);
  return veil;
};

const settle = () => {
  active = false;
  veil?.classList.remove("locale-veil-in");
  window.clearTimeout(cleanupTimer);
  cleanupTimer = window.setTimeout(() => {
    veil?.remove();
    veil = null;
  }, FADE);
};

const watch = () => {
  if (!active) return;
  ensureVeil();
  if (document.documentElement.lang === target && !hideTimer) {
    hideTimer = window.setTimeout(
      () => {
        hideTimer = 0;
        settle();
      },
      Math.max(0, MIN_VISIBLE - (performance.now() - shownAt)),
    );
  }
  requestAnimationFrame(watch);
};

export const startLocaleSwitch = (nextLocale: string) => {
  if (!ensureVeil()) return;
  window.clearTimeout(hideTimer);
  window.clearTimeout(cleanupTimer);
  window.clearTimeout(capTimer);
  hideTimer = 0;
  active = true;
  target = nextLocale;
  shownAt = performance.now();
  requestAnimationFrame(() => requestAnimationFrame(() => veil?.classList.add("locale-veil-in")));
  requestAnimationFrame(watch);
  capTimer = window.setTimeout(settle, CAP);
};
