import { getLocale, getTranslations } from "next-intl/server";

import ContactLink from "@/_components/ContactLink";
import SlideUpInView from "@/_components/SlideUpInView";
import { phoneDisplay, phoneHref } from "@/utils/phone";

const OutroSection = async () => {
  const t = await getTranslations("Outro");
  const locale = await getLocale();

  return (
    <section id="contact">
      <SlideUpInView>
        <p className="text-center text-2xl md:text-3xl font-semibold leading-normal md:leading-normal mb-4 md:mb-6">
          {t.rich("heading", { br: () => <br /> })}
        </p>

        <div className="w-72 md:w-80 mx-auto grid grid-cols-3 text-sm md:text-base gap-2 md:gap-3 p-6 md:p-8 rounded-2xl bg-dark/5 dark:bg-light/10">
          <p className="font-semibold">Phone</p>
          <ContactLink
            channel="phone"
            href={phoneHref(locale)}
            target="_blank"
            className="col-span-2 w-fit focus-visible:rounded-sm"
          >
            <p>{phoneDisplay(locale)}</p>
          </ContactLink>

          <p className="font-semibold">Email</p>
          <ContactLink
            channel="email"
            href="mailto:me@mingyu.dev"
            target="_blank"
            className="col-span-2 w-fit focus-visible:rounded-sm"
          >
            <p>me@mingyu.dev</p>
          </ContactLink>

          <p className="font-semibold">GitHub</p>
          <ContactLink
            channel="github"
            href="https://github.com/bestdevmgp"
            target="_blank"
            className="col-span-2 w-fit focus-visible:rounded-sm"
          >
            <p>@bestdevmgp</p>
          </ContactLink>

          <p className="font-semibold">LinkedIn</p>
          <ContactLink
            channel="linkedin"
            href="https://www.linkedin.com/in/min-gyu"
            target="_blank"
            className="col-span-2 w-fit focus-visible:rounded-sm"
          >
            <p>in/min-gyu</p>
          </ContactLink>
        </div>
      </SlideUpInView>
    </section>
  );
};

export default OutroSection;
