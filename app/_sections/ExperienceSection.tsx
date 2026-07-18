import React from "react";

import { getLocale, getTranslations } from "next-intl/server";

import ExpCard from "@/_components/ExpCard";
import SectionWatcher from "@/_components/SectionWatcher";
import SlideUpInView from "@/_components/SlideUpInView";
import prisma from "@/lib/prisma";
import { getSkills } from "@/utils/api";
import { applyLocaleAll } from "@/utils/localize";
import { parsePrismaJSON } from "@/utils/parsePrisma";

async function getExperience(locale: string) {
  const experiences = applyLocaleAll(await prisma.experience.findMany({ orderBy: { index: "asc" } }), locale);

  const expWithSkills = await Promise.all(
    experiences.map(async ({ skill_ids, ...exp }) => {
      const skills = await getSkills(skill_ids);
      return { ...exp, skills };
    }),
  );

  return expWithSkills.map(({ links, ...res }) => ({
    links: links.map(link => parsePrismaJSON<{ href: string; label: string }>(link)),
    ...res,
  }));
}

export default async function ExperienceSection() {
  const t = await getTranslations("Experience");
  const data = await getExperience(await getLocale());

  const interns = data.filter(({ category }) => category === "INTERN");
  const activities = data.filter(({ category }) => category === "ACTIVITY");
  const projects = data.filter(({ category }) => category === "PROJECT");

  return (
    <SectionWatcher id="experience">
      <SlideUpInView>
        <h2 className="section-eyebrow">{t("eyebrow")}</h2>
        <p className="section-title">{t.rich("title", { br: () => <br /> })}</p>

        {[
          { title: t("groupIntern"), data: interns },
          { title: t("groupProject"), data: projects },
          { title: t("groupActivity"), data: activities },
        ]
          .filter(({ data }) => data.length > 0)
          .map(({ title, data }) => (
            <React.Fragment key={`exp-${title}`}>
              <div className="flex gap-4 items-center md:max-w-[768px] mx-auto mt-12 mb-8">
                <div className="w-full h-px bg-linear-to-l from-foreground/15" />
                <p className="shrink-0 text-xs md:text-sm text-foreground/50">{title}</p>
                <div className="w-full h-px bg-linear-to-r from-foreground/15" />
              </div>

              <div className="flex flex-col gap-8 md:gap-10">
                {data.map(props => (
                  <ExpCard key={`exp-${title}-card-${props.id}`} {...props} />
                ))}
              </div>
            </React.Fragment>
          ))}
      </SlideUpInView>
    </SectionWatcher>
  );
}
