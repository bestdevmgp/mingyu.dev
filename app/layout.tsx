import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Gothic_A1, Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import SmoothScroll from "@/_components/SmoothScroll";
import ThemeScript from "@/_components/ThemeScript";

import type { Metadata } from "next";

import "lenis/dist/lenis.css";
import "./globals.css";

const gothicA1 = Gothic_A1({
  weight: ["400", "600", "700", "800"],
  subsets: ["latin"],
});

const inter = Inter({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mingyu.dev"),
  title: "박민규 | 백엔드 개발자",
  description: "백엔드 개발자 박민규입니다. Java 및 Kotlin으로 Spring Boot 웹 애플리케이션 서버를 개발합니다.",
  keywords: ["백엔드", "백엔드 개발자", "백엔드 개발자 포트폴리오"],
  openGraph: {
    title: "박민규 | 백엔드 개발자",
    description: "백엔드 개발자 박민규입니다. Java 및 Kotlin으로 Spring Boot 웹 애플리케이션 서버를 개발합니다.",
    url: "https://mingyu.dev",
    siteName: "박민규 | 백엔드 개발자",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "박민규 | 백엔드 개발자",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  alternates: {
    canonical: "/",
  },
};

export default async function RootLayout(props: { children: React.ReactNode; modal: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={locale === "en" ? inter.className : gothicA1.className}>
        <ThemeScript />
        <SmoothScroll />
        <NextIntlClientProvider locale={locale} messages={messages}>
          {props.children}
          {props.modal}
          <div id="modal-root" />
          <Analytics />
          <SpeedInsights />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
