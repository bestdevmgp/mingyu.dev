"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { localePath } from "@i18n/config";

const HomeButton = () => {
  const t = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    try {
      sessionStorage.setItem("from-project", "1");
    } catch {}
  }, []);

  const moveHome = () => {
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
