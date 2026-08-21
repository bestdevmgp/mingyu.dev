import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";

import DeferredAnalytics from "@/_components/DeferredAnalytics";
import SiteLoader from "@/_components/SiteLoader";
import SmoothScroll from "@/_components/SmoothScroll";
import ThemeScript from "@/_components/ThemeScript";

import type { Metadata } from "next";

import "./globals.css";

const inter = Inter({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  preload: false,
});

const cjkFontClass: Record<string, string> = {
  ja: "font-ja",
  "zh-Hans": "font-zh-hans",
  "zh-Hant": "font-zh-hant",
};

const PRETENDARD_HREF = "/fonts/pretendard-core-v1.woff2";

const webFontHref: Record<string, string> = {
  ja: "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700;800&display=swap",
  "zh-Hans": "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700;800&display=swap",
  "zh-Hant": "https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;600;700;800&display=swap",
};

const OG_LOCALE: Record<string, string> = {
  ko: "ko_KR",
  en: "en_US",
  ja: "ja_JP",
  "zh-Hans": "zh_CN",
  "zh-Hant": "zh_TW",
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("Meta");
  const title = t("title");
  const description = t("description");

  return {
    metadataBase: new URL("https://mingyu.dev"),
    title,
    description,
    keywords: ["백엔드", "백엔드 개발자", "백엔드 개발자 포트폴리오", "backend developer", "portfolio"],
    openGraph: {
      title,
      description,
      url: "https://mingyu.dev",
      siteName: title,
      images: [
        {
          url: "/opengraph-image.jpg",
          width: 2400,
          height: 1260,
          alt: title,
        },
      ],
      locale: OG_LOCALE[locale] ?? "ko_KR",
      type: "website",
    },
    alternates: {
      canonical: "/",
    },
  };
}

export default async function RootLayout(props: { children: React.ReactNode; modal: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  const fontHref = webFontHref[locale];

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {locale === "ko" && (
          <link rel="preload" as="font" type="font/woff2" href={PRETENDARD_HREF} crossOrigin="anonymous" />
        )}
        {fontHref && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link rel="preload" as="style" href={fontHref} id="webfont-css" />
            <script
              dangerouslySetInnerHTML={{
                __html:
                  "(function(){var l=document.getElementById('webfont-css');if(!l)return;var d=0;function a(){if(d)return;d=1;l.rel='stylesheet'}l.addEventListener('load',a,{once:true});addEventListener('load',a,{once:true})})()",
              }}
            />
            <noscript>
              <link rel="stylesheet" href={fontHref} />
            </noscript>
          </>
        )}
      </head>
      <body className={locale === "en" ? inter.className : (cjkFontClass[locale] ?? "font-ko")}>
        <ThemeScript />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var r=document.documentElement,SHOW=400,MIN=300,SOFT=800,CAP=5000,FADE=400,shown=0,done=0,at=0,t=0;" +
              "r.classList.add('loader-js');" +
              "function gone(){r.classList.add('loader-gone')}" +
              "function hide(){r.classList.add('loader-done');setTimeout(gone,FADE)}" +
              "function finish(){if(done)return;done=1;clearTimeout(t);if(!shown)return hide();" +
              "var left=MIN-(performance.now()-at);if(left>0)setTimeout(hide,left);else hide()}" +
              "function painted(){try{return performance.getEntriesByType('paint').length>0}catch(e){return false}}" +
              "function show(){if(done||shown||painted())return;shown=1;at=performance.now();r.classList.add('loader-showing')}" +
              "var late=SHOW-performance.now();if(late<=0)show();else t=setTimeout(show,late);setTimeout(finish,CAP);" +
              "function ready(){var p=document.fonts&&document.fonts.ready;setTimeout(finish,SOFT);" +
              "if(p&&p.then)p.then(function(){requestAnimationFrame(finish)},finish);else requestAnimationFrame(finish)}" +
              "if(document.readyState==='loading')addEventListener('DOMContentLoaded',ready,{once:true});else ready()})();" +
              "(function(){var d=document.documentElement,w=0;function s(){d.style.setProperty('--vh0',window.innerHeight/100+'px');w=window.innerWidth}s();addEventListener('resize',function(){if(window.innerWidth!==w)s()})})();" +
              "(function(){var r=document.documentElement;if(!window.IntersectionObserver)return;r.classList.add('reveal-js');" +
              "function s(){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-revealed');io.unobserve(e.target)}})},{rootMargin:'0px 0px -9% 0px'});" +
              "function w(n){if(n.nodeType!==1)return;if(n.matches('[data-reveal]')&&!n.classList.contains('is-revealed'))io.observe(n);" +
              "n.querySelectorAll('[data-reveal]:not(.is-revealed)').forEach(function(el){io.observe(el)})}w(document.body);" +
              "new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(w)})}).observe(document.body,{childList:true,subtree:true})}" +
              "if(document.readyState!=='loading')s();else addEventListener('DOMContentLoaded',s,{once:true})})();" +
              "(function(){try{if(location.pathname.indexOf('/project/')===0)sessionStorage.setItem('from-project','1')}catch(e){}})();" +
              "(function(){if(!matchMedia('(hover: none)').matches)return;var o=null;" +
              "function c(){if(o){o.classList.remove('skill-open');o=null}}" +
              "document.addEventListener('click',function(e){var t=e.target&&e.target.closest?e.target.closest('[data-skill]'):null;" +
              "if(!t||t===o){c();return}c();t.classList.add('skill-open');o=t},true);" +
              "addEventListener('scroll',c,{capture:true,passive:true});addEventListener('touchmove',c,{passive:true})})();" +
              "addEventListener('load',function(){var r=document.documentElement,h=document.getElementById('main');r.classList.add('anim-ready');if(!h||!window.IntersectionObserver)return;new IntersectionObserver(function(e){r.classList.toggle('hero-idle',!e[0].isIntersecting)},{threshold:0}).observe(h)},{once:true})",
          }}
        />
        <SiteLoader />
        <SmoothScroll />
        <NextIntlClientProvider locale={locale} messages={messages}>
          {props.children}
          {props.modal}
          <div id="modal-root" />
          <DeferredAnalytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
