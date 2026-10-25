"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { localePath } from "@i18n/config";

import { unprefixedPath } from "@/utils/localePreference";

const rememberOrigin = (origin: "page" | "return") => {
  try {
    sessionStorage.setItem("from-project", origin);
  } catch {}
};

const HomeButton = () => {
  const t = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();

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
      className="w-full mt-8 md:mt-12 py-4 rounded-md bg-foreground/5 text-foreground/75 hover:bg-foreground/10 transition-colors duration-200 -outline-offset-1"
    >
      {t("backToProjects")}
    </button>
  );
};

export default HomeButton;
