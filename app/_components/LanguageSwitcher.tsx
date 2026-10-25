"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check } from "react-feather";

import cn from "classnames";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { localePath, locales, type Locale } from "@i18n/config";

import { unprefixedPath, writeLocaleCookie } from "@/utils/localePreference";
import { beginLocaleSwitch, endLocaleSwitch, isLocaleSwitching, onLocaleSwitchEnd } from "@/utils/localeSwitch";
import useDropdown from "@/utils/useDropdown";

import DropdownPanel from "./DropdownPanel";
import Tooltip from "./Tooltip";
import { setLocale, track } from "./analytics/posthog";

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

let refocusTrigger = false;

let queuedSwitch: { locale: Locale; viaKeyboard: boolean; variant: "dropdown" | "inline" } | null = null;

interface LanguageSwitcherProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "dropdown" | "inline";
  hardNavigation: boolean;
  onLocaleChange?: (viaKeyboard: boolean) => void;
}

const LanguageSwitcher = ({
  variant = "dropdown",
  hardNavigation,
  onLocaleChange,
  className,
  ...props
}: LanguageSwitcherProps) => {
  const t = useTranslations("Header");
  const activeLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const { isOpen, setIsOpen, ref } = useDropdown('[role="option"][aria-selected="true"]');

  const [pendingLocale, setPendingLocale] = useState<Locale | null>(null);
  const displayLocale = pendingLocale ?? activeLocale;
  const [navigating, startNavigation] = useTransition();
  const navigationTarget = useRef<Locale | null>(null);

  useEffect(() => {
    const target = navigationTarget.current;
    if (navigating || !target) return;
    navigationTarget.current = null;
    if (target !== activeLocale) endLocaleSwitch();
  }, [navigating, activeLocale]);

  const triggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const trigger = triggerRef.current;
    if (!refocusTrigger || !trigger?.getClientRects().length) return;
    refocusTrigger = false;
    trigger.focus({ preventScroll: true, focusVisible: true });
  }, [activeLocale]);

  const changeLocale = (nextLocale: Locale, viaKeyboard: boolean) => {
    setIsOpen(false);
    if (nextLocale === displayLocale) return;
    if (isLocaleSwitching()) {
      queuedSwitch = { locale: nextLocale, viaKeyboard, variant };
      setPendingLocale(nextLocale);
      return;
    }
    onLocaleChange?.(viaKeyboard);
    refocusTrigger = variant === "dropdown" && viaKeyboard;
    setPendingLocale(nextLocale);
    const path = unprefixedPath(pathname);
    const target = writeLocaleCookie(nextLocale) ? path || "/" : localePath(nextLocale, path);
    track("locale_changed", { from: displayLocale, to: nextLocale });
    setLocale(nextLocale);
    if (hardNavigation) {
      window.location.replace(target + window.location.hash);
      return;
    }
    beginLocaleSwitch();
    navigationTarget.current = nextLocale;
    startNavigation(() => (target !== pathname ? router.replace(target) : router.refresh()));
  };

  const changeLocaleRef = useRef(changeLocale);
  useEffect(() => {
    changeLocaleRef.current = changeLocale;
  });
  useEffect(
    () =>
      onLocaleSwitchEnd(() => {
        setPendingLocale(null);
        if (queuedSwitch?.variant !== variant) return;
        const { locale, viaKeyboard } = queuedSwitch;
        queuedSwitch = null;
        changeLocaleRef.current(locale, viaKeyboard);
      }),
    [variant],
  );

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
                onClick={event => changeLocale(locale, event.detail === 0)}
                className={cn(
                  "px-2 py-1 rounded-md text-sm whitespace-nowrap transition-colors duration-200 -outline-offset-1",
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
      <Tooltip label={t("changeLanguage")}>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          aria-label={`${LOCALE_LABELS[activeLocale]}, ${t("changeLanguage")}`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={cn(
            "flex items-center gap-[3px] transition-colors duration-200 focus-visible:rounded-md",
            isOpen ? "text-foreground" : "text-foreground/55 hover:text-foreground",
          )}
        >
          <GlobeSimpleIcon
            className="w-[22px] h-[22px] -ml-[2px] -translate-x-[0.5px] [stroke-width:4.197]"
            aria-hidden="true"
          />
          <span
            className={cn(
              "font-semibold",
              activeLocale === "en" ? "text-[13px]/4" : "text-[12px]/4",
              activeLocale === "ko" && "translate-y-[0.5px]",
              activeLocale === "ja" && "-translate-y-[0.5px]",
              activeLocale === "en" && "translate-y-[0.4px]",
              activeLocale.startsWith("zh") && "-translate-y-[0.2px]",
            )}
          >
            {LOCALE_LABELS[activeLocale]}
          </span>
        </button>
      </Tooltip>

      <DropdownPanel
        as="ul"
        isOpen={isOpen}
        role="listbox"
        label={t("changeLanguage")}
        itemSelector='[role="option"]'
        className="min-w-32 list-none indent-0"
      >
        {locales.map(locale => (
          <li key={locale} role="none">
            <button
              type="button"
              role="option"
              aria-selected={locale === activeLocale}
              onClick={event => changeLocale(locale, event.detail === 0)}
              className={cn(
                "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors duration-200 -outline-offset-1",
                "hover:bg-foreground/5",
                locale === activeLocale ? "font-semibold text-foreground" : "font-normal text-foreground/70",
              )}
            >
              {LOCALE_LABELS[locale]}
              {locale === activeLocale && <Check className="w-4 h-4 text-primary" strokeWidth={2} />}
            </button>
          </li>
        ))}
      </DropdownPanel>
    </div>
  );
};

export default LanguageSwitcher;
