import localFont from "next/font/local";

export const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.subset.woff2",
  weight: "400 800",
  style: "normal",
  display: "swap",
  preload: true,
  declarations: [{ prop: "size-adjust", value: "106%" }],
  adjustFontFallback: false,
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "system-ui",
    "Apple SD Gothic Neo",
    "Malgun Gothic",
    "Noto Sans KR",
    "sans-serif",
  ],
});
