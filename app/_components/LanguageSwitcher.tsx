"use client";

import { useRef, useState } from "react";
import { Check } from "react-feather";

import cn from "classnames";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { LOCALE_COOKIE, locales, type Locale } from "@i18n/config";

import { beginLocaleSwitch } from "@/utils/localeSwitch";
import useOnClickOutside from "@/utils/useOnClickOutside";

type SvgProps = React.SVGProps<SVGSVGElement>;

const GlobeSimpleIcon = (props: SvgProps) => (
  <svg
    viewBox="0 0 256 256"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth={2.4}
    strokeLinejoin="round"
    {...props}
  >
    <path d="M128 24a104 104 0 1 0 104 104A104.12 104.12 0 0 0 128 24m87.62 96h-39.83c-1.79-36.51-15.85-62.33-27.38-77.6a88.19 88.19 0 0 1 67.22 77.6ZM96.23 136h63.54c-2.31 41.61-22.23 67.11-31.77 77c-9.55-9.9-29.46-35.4-31.77-77m0-16c2.31-41.61 22.23-67.11 31.77-77c9.55 9.93 29.46 35.43 31.77 77Zm11.36-77.6C96.06 57.67 82 83.49 80.21 120H40.37a88.19 88.19 0 0 1 67.22-77.6M40.37 136h39.84c1.82 36.51 15.85 62.33 27.38 77.6A88.19 88.19 0 0 1 40.37 136m108 77.6c11.53-15.27 25.56-41.09 27.38-77.6h39.84a88.19 88.19 0 0 1-67.18 77.6Z" />
  </svg>
);

const LOCALE_LABELS: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
  "zh-Hans": "简体中文",
  "zh-Hant": "繁體中文",
};

const labelNudge: Record<string, string> = {
  en: "relative top-[-0.25px]",
  ja: "relative top-[-0.5px]",
  "zh-Hans": "relative top-[-0.5px]",
  "zh-Hant": "relative top-[-0.5px]",
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
    beginLocaleSwitch();
    router.refresh();
  };

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2", className)} {...props}>
        <GlobeSimpleIcon
          className="w-[21.25px] h-[21.25px] shrink-0 -translate-x-[1px] text-foreground/55"
          aria-hidden="true"
        />
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
        className={cn(
          "flex items-center gap-1 transition-colors",
          isOpen ? "text-foreground" : "text-foreground/55 hover:text-foreground",
        )}
      >
        <GlobeSimpleIcon className="w-[20.5px] h-[20.5px] [stroke-width:7.2]" aria-hidden="true" />
        <span className={cn("hidden md:inline text-xs font-semibold", labelNudge[activeLocale])}>
          {LOCALE_LABELS[activeLocale]}
        </span>
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
