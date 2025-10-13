import Link from "next/link";

import SectionWatcher from "@/_components/SectionWatcher";
import SlideUpInView from "@/_components/SlideUpInView";

const OutroSection = () => {
  return (
    <SectionWatcher id="contact">
      <SlideUpInView>
        <p className="text-center text-2xl md:text-3xl font-semibold leading-normal md:leading-normal mb-4 md:mb-6">
          감사합니다
          <br />
          더 궁금한 점이 있다면
          <br />
          편하게 연락주세요
        </p>

        <div className="w-72 md:w-80 mx-auto grid grid-cols-3 text-sm md:text-base gap-2 md:gap-3 p-6 md:p-8 rounded-2xl bg-dark/5 dark:bg-light/10">
          <p className="font-semibold">전화번호</p>
          <Link href="tel:01036723858" target="_blank" className="col-span-2">
            <p>010-3672-3858</p>
          </Link>

          <p className="font-semibold">이메일</p>
          <Link href="mailto:me@mingyu.dev" target="_blank" className="col-span-2">
            <p>me@mingyu.dev</p>
          </Link>

          <p className="font-semibold">GitHub</p>
          <Link href="https://github.com/bestdevmgp" target="_blank" className="col-span-2">
            <p>@bestdevmgp</p>
          </Link>

          <p className="font-semibold">LinkedIn</p>
          <Link href="https://www.linkedin.com/in/bestdevmgp/" target="_blank" className="col-span-2">
            <p>in/bestdevmgp</p>
          </Link>
        </div>
      </SlideUpInView>
    </SectionWatcher>
  );
};

export default OutroSection;
