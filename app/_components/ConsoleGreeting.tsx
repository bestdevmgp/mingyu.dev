"use client";

import { useEffect } from "react";

import afterPageLoad from "@/utils/afterPageLoad";

import { FLOWER_PATH, SPARKLE_PATH } from "./markPaths";

const SHAPES = [
  { color: "#e2ff00", viewBox: 16, size: 76, gap: 0, path: SPARKLE_PATH },
  { color: "#00c676", viewBox: 24, size: 72, gap: 16, path: FLOWER_PATH },
  { color: "#007aff", viewBox: 24, size: 71, gap: 21, path: "M0 0H9V7.5H16.5V15L24 15V24H0V0Z" },
];
const EMAIL = "me@mingyu.dev";
const MESSAGES: Record<string, [string, string]> = {
  ko: ["방문해 주셔서 감사합니다. 백엔드 개발자 박민규입니다.", "더 궁금한 점이 있으시다면 편하게 연락 주세요."],
  en: [
    "Thank you for visiting. I'm Mingyu Park, a backend developer.",
    "If you'd like to know more, feel free to reach out.",
  ],
  ja: [
    "ご訪問いただき、ありがとうございます。バックエンド開発者のパク・ミンギュです。",
    "もっと知りたいことがあれば、お気軽にご連絡ください。",
  ],
  "zh-Hans": ["感谢您的来访。我是后端开发者朴珉圭。", "如果您想了解更多，欢迎随时联系我。"],
  "zh-Hant": ["感謝您的來訪。我是後端開發者朴珉圭。", "如果您想了解更多，歡迎隨時與我聯絡。"],
};

let greeted = false;

const shapesStyle = () => {
  const height = Math.max(...SHAPES.map(({ size }) => size));
  let width = 0;
  let shapes = "";
  for (const { color, viewBox, size, gap, path } of SHAPES) {
    width += gap;
    shapes += `<svg x="${width}" y="${(height - size) / 2}" width="${size}" height="${size}" viewBox="0 0 ${viewBox} ${viewBox}"><path fill="${color}" d="${path}"/></svg>`;
    width += size;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${shapes}</svg>`;
  return `font-size:0;line-height:0;padding:${height / 2}px ${width / 2}px;background:url("data:image/svg+xml,${encodeURIComponent(svg)}") center/${width}px ${height}px no-repeat`;
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
  const styles = [shapesStyle(), ""];
  const [intro, contact] = MESSAGES[document.documentElement.lang] ?? MESSAGES.ko;
  window.setTimeout(console.log.bind(console, `\n%c %c\n\n${intro}\n${contact}\n${emailLink(styles)}`, ...styles));
};

const ConsoleGreeting = () => {
  useEffect(() => afterPageLoad(greet, 1), []);

  return null;
};

export default ConsoleGreeting;
