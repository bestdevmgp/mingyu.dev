"use client";

import { ExternalLink } from "react-feather";

import CTAButton from "@/_components/buttons/CTAButton";
import ProfileImage from "@/_components/profile/ProfileImage";

const MainSection = () => {
  return (
    <div id="main" className="w-full pb-28 flex flex-col items-center">
      <div className="w-full relative flex justify-center origin-bottom pt-8">
        <ProfileImage />
      </div>

      <h1 className="w-full px-6 md:px-8 pt-8 pb-6 md:pb-8 bg-light z-40 dark: dark:bg-dark">
        안녕하세요,
        <br />
        백엔드 개발자
        <br />
        <em>박민규</em>입니다.
      </h1>

      <p className="text-center text-base md:text-lg font-normal text-gray-400 break-keep mb-6 md:mb-8">
        Spring Boot를 중심으로 웹 애플리케이션 서버를 설계하고 개발합니다.
        <br />
        함께 제품을 만들고 성장시킬 곳을 찾고 있습니다.
      </p>

      <CTAButton
        label="포트폴리오 바로가기"
        suffix={<ExternalLink className="w-4 h-4" />}
        link="https://cv.mingyu.dev"
      />
    </div>
  );
};

export default MainSection;
