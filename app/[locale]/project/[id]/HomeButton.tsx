"use client";

import { useEffect } from "react";

import cn from "classnames";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { localePath } from "@i18n/config";

import { unprefixedPath } from "@/utils/localePreference";
import { neutralFillClasses } from "@/utils/pressClasses";
import useTouchPress from "@/utils/useTouchPress";

const rememberOrigin = (origin: "page" | "return") => {
  try {
    sessionStorage.setItem("from-project", origin);
  } catch {}
};

const HomeButton = () => {
  const t = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();
  const [isPressed, pressHandlers] = useTouchPress();

  useEffect(() => {
    rememberOrigin("page");
    const markReturn = () => {
      if (!unprefixedPath(window.location.pathname)) rememberOrigin("return");
    };
    window.addEventListener("popstate", markReturn);
    return () => window.removeEventListener("popstate", markReturn);
  }, []);

  const moveHome = () => {
    rememberOrigin("return");
    router.replace(localePath(locale));
  };
  return (
    <button
      onClick={moveHome}
      {...pressHandlers}
      className={cn(
        "w-full mt-8 md:mt-12 py-4 rounded-md text-foreground/75 transition-colors duration-200 ease-button -outline-offset-1",
        neutralFillClasses(isPressed),
      )}
    >
      {t("backToProjects")}
    </button>
  );
};

export default HomeButton;
