"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const HomeButton = () => {
  const t = useTranslations("Common");
  const router = useRouter();

  useEffect(() => {
    try {
      sessionStorage.setItem("from-project", "1");
    } catch {}
  }, []);

  const moveHome = () => {
    router.replace("/");
  };
  return (
    <button
      onClick={moveHome}
      className="w-full mt-8 md:mt-12 py-4 rounded-md bg-foreground/5 text-foreground/75 hover:bg-foreground/10 transition-colors duration-200"
    >
      {t("backToProjects")}
    </button>
  );
};

export default HomeButton;
