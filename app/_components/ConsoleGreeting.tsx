"use client";

import { useEffect } from "react";

const LOGO = [
  ".........##.........",
  "........#..#........",
  "..###...#..#...###..",
  "..#..##.#..#.##..#..",
  "..#....#....#....#..",
  "...#............#...",
  "...#............#...",
  "....#..........#....",
  ".###............###.",
  "#..................#",
  "#..................#",
  ".###............###.",
  "....#..........#....",
  "...#............#...",
  "...#............#...",
  "..#....#....#....#..",
  "..#..##.#..#.##..#..",
  "..###...#..#...###..",
  "........#..#........",
  ".........##.........",
];

const LIME = "#e2ff00";
const LOGO_SIZE = 140;
const EMAIL = "me@mingyu.dev";
const MESSAGES: Record<string, [string, string]> = {
  ko: ["관심을 갖고 방문해 주셔서 감사합니다. 백엔드 개발자 박민규입니다.", "더 궁금한 점이 있으시다면 연락해주세요. "],
  en: [
    "Thank you for your interest and for visiting. I'm Mingyu Park, a backend developer.",
    "If there's anything else you'd like to know, please get in touch. ",
  ],
  ja: [
    "関心を持ってご訪問いただき、ありがとうございます。バックエンド開発者のパク・ミンギュです。",
    "もっと知りたいことがあれば、お気軽にご連絡ください。",
  ],
  "zh-Hans": ["感谢您的关注与来访。我是后端开发者朴珉圭。", "如果还有想了解的，欢迎联系我。"],
  "zh-Hant": ["感謝您的關注與來訪。我是後端開發者朴珉圭。", "如果還有想了解的，歡迎聯絡我。"],
};

let greeted = false;

const logoStyle = () => {
  const path = LOGO.flatMap((row, y) =>
    [...row.matchAll(/#+/g)].map(({ 0: run, index }) => `M${index} ${y}h${run.length}v1h-${run.length}z`),
  ).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LOGO.length} ${LOGO.length}" shape-rendering="crispEdges"><path fill="${LIME}" d="${path}"/></svg>`;
  return `font-size:0;line-height:0;padding:${LOGO_SIZE / 2}px;background:url("data:image/svg+xml,${encodeURIComponent(svg)}") center/${LOGO_SIZE}px no-repeat`;
};

const emailLink = (styles: string[]) => {
  if (!("userAgentData" in navigator)) return EMAIL;
  const href = `${location.origin}/${EMAIL}`;
  const hidden = href.length - EMAIL.length;
  styles.push(`text-indent:-${hidden}ch`);
  return `%c${href}${"\u00a0".repeat(hidden)}`;
};

const greet = () => {
  if (greeted) return;
  greeted = true;
  const styles = [logoStyle(), ""];
  const [intro, contact] = MESSAGES[document.documentElement.lang] ?? MESSAGES.ko;
  console.log(`%c %c\n\n${intro}\n${contact}${emailLink(styles)}`, ...styles);
};

const ConsoleGreeting = () => {
  useEffect(() => {
    let idleId = 0;
    const schedule = () => {
      idleId = window.requestIdleCallback
        ? window.requestIdleCallback(greet, { timeout: 2000 })
        : window.setTimeout(greet, 1);
    };

    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      window.removeEventListener("load", schedule);
      if (idleId && window.cancelIdleCallback) window.cancelIdleCallback(idleId);
    };
  }, []);

  return null;
};

export default ConsoleGreeting;
