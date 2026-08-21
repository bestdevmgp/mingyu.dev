"use client";

import { useLayoutEffect } from "react";

import { endLocaleSwitch } from "@/utils/localeSwitch";

const LocaleDocumentSync = ({ locale }: { locale: string }) => {
  useLayoutEffect(() => {
    document.documentElement.lang = locale;

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
