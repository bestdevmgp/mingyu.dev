"use client";

import { useRef, useState } from "react";
import { Check, Globe } from "react-feather";

import cn from "classnames";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { LOCALE_COOKIE, locales, type Locale } from "@i18n/config";

import useOnClickOutside from "@/utils/useOnClickOutside";

const LOCALE_LABELS: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
  "zh-Hans": "简体中文",
  "zh-Hant": "繁體中文",
};

const setLocaleCookie = (locale: Locale) => {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
};

interface LanguageSwitcherProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "dropdown" | "inline";
}

const LanguageSwitcher = ({ variant = "dropdown", className, ...props }: LanguageSwitcherProps) => {
  const t = useTranslations("Header");
  const activeLocale = useLocale() as Locale;
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setIsOpen(false));

  const [pendingLocale, setPendingLocale] = useState<Locale | null>(null);
  const displayLocale = pendingLocale ?? activeLocale;

  const changeLocale = (nextLocale: Locale) => {
    setIsOpen(false);
    if (nextLocale === displayLocale) return;
    setPendingLocale(nextLocale);
    setLocaleCookie(nextLocale);
    router.refresh();
  };

  if (variant === "inline") {
    return (
      <div className={cn("flex items-start gap-2", className)} {...props}>
        <Globe className="w-[18px] h-[18px] shrink-0 mt-[5px] text-foreground/55" strokeWidth={1.5} aria-hidden />
        <div className="flex flex-wrap items-center gap-1" role="group" aria-label={t("changeLanguage")}>
          {locales.map(locale => {
            const isActive = locale === displayLocale;
            return (
              <button
                key={locale}
                type="button"
                aria-pressed={isActive}
                onClick={() => changeLocale(locale)}
                className={cn(
                  "px-2 py-1 rounded-md text-sm whitespace-nowrap transition-colors",
                  isActive
                    ? "font-semibold text-foreground bg-foreground/10"
                    : "font-normal text-foreground/55 hover:text-foreground",
                )}
              >
                {LOCALE_LABELS[locale]}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)} ref={ref} {...props}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={t("changeLanguage")}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex items-center gap-1 text-foreground/55 hover:text-foreground transition-colors"
      >
        <Globe className="w-[18px] h-[18px]" strokeWidth={1.5} />
        <span className="hidden md:inline text-xs font-semibold">{LOCALE_LABELS[activeLocale]}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ type: "spring", bounce: 0, duration: 0.2 }}
            style={{ transformOrigin: "top right" }}
            className="absolute right-[-2px] top-full mt-2 min-w-32 p-1 rounded-xl list-none indent-0
              bg-background border border-foreground/10 shadow-lg shadow-black/5 z-50"
          >
            {locales.map(locale => (
              <li key={locale} className="indent-0">
                <button
                  type="button"
                  role="option"
                  aria-selected={locale === activeLocale}
                  onClick={() => changeLocale(locale)}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors",
                    "hover:bg-foreground/5",
                    locale === activeLocale ? "font-semibold text-foreground" : "font-normal text-foreground/70",
                  )}
                >
                  {LOCALE_LABELS[locale]}
                  {locale === activeLocale && <Check className="w-4 h-4 text-primary" strokeWidth={2} />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
