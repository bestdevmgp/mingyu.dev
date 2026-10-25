"use client";

import { useLayoutEffect } from "react";

import { useRouter } from "next/navigation";

import { hasLocalePrefix, readLocaleCookie } from "@/utils/localePreference";
import { beginLocaleSwitch, endLocaleSwitch, markLocaleCommitted } from "@/utils/localeSwitch";

import { setLocale } from "./analytics/posthog";

const LocaleDocumentSync = ({ locale }: { locale: string }) => {
  const router = useRouter();

  useLayoutEffect(() => {
    markLocaleCommitted();
    if (document.documentElement.lang !== locale) document.documentElement.lang = locale;

    const stored = readLocaleCookie();
    if (stored && stored !== locale && !hasLocalePrefix(window.location.pathname)) {
      setLocale(stored);
      beginLocaleSwitch({ hold: false });
      router.refresh();
      return;
    }

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
  }, [locale, router]);

  return null;
};

export default LocaleDocumentSync;
