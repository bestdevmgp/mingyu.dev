export const FONT_PRELOAD_PATH: Record<string, string> = {
  ko: "/fonts/pretendard-core-v9.woff2",
  en: "/fonts/inter-v3.woff2",
};

export const FONT_PRELOAD_LINK: Record<string, string> = Object.fromEntries(
  Object.entries(FONT_PRELOAD_PATH).map(([locale, path]) => [
    locale,
    `<${path}>; rel=preload; as="font"; crossorigin="anonymous"; type="font/woff2"`,
  ]),
);
