"use client";

import { useRouter } from "next/navigation";

const HomeButton = () => {
  const router = useRouter();

  const moveHome = () => {
    router.replace("/");
  };
  return (
    <button
      onClick={moveHome}
      className="w-full mt-8 md:mt-12 py-4 rounded-md bg-foreground/5 text-foreground/75 hover:bg-foreground/10 hover:text-foreground"
    >
      메인으로 돌아가기
    </button>
  );
};

export default HomeButton;
