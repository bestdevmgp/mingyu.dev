"use client";

import { useLayoutEffect } from "react";

import { endLocaleSwitch } from "@/utils/localeSwitch";

const LocaleDocumentSync = ({ locale }: { locale: string }) => {
  useLayoutEffect(() => {
    if (document.documentElement.lang !== locale) document.documentElement.lang = locale;

    const webfontCss = document.getElementById("webfont-css");
    if (webfontCss instanceof HTMLLinkElement && webfontCss.rel !== "stylesheet") webfontCss.rel = "stylesheet";

    let middle = 0;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      middle = requestAnimationFrame(() => {
        inner = requestAnimationFrame(endLocaleSwitch);
      });
    });

    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(middle);
      cancelAnimationFrame(inner);
    };
  }, [locale]);

  return null;
};

export default LocaleDocumentSync;
