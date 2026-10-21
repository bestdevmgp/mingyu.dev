import React from "react";

import { getLocale, getTranslations } from "next-intl/server";

import ExpCard from "@/_components/ExpCard";
import SlideUpInView from "@/_components/SlideUpInView";
import content from "@/lib/content";
import { getSkills } from "@/utils/api";
import { applyLocaleAll } from "@/utils/localize";

function getExperience(locale: string) {
  return applyLocaleAll(content.experience, locale).map(exp => ({
    category: exp.category,
    card: {
      id: exp.id,
      period: exp.period,
      is_active: exp.is_active,
      title: exp.title,
      job_title: exp.job_title,
      sub_title: exp.sub_title,
      site_url: exp.site_url,
      items: exp.items,
      links: exp.links,
      skills: getSkills(exp.skill_ids),
    },
  }));
}

export default async function ExperienceSection() {
  const t = await getTranslations("Experience");
  const experiences = getExperience(await getLocale());

  const interns = experiences.filter(({ category }) => category === "INTERN");
  const activities = experiences.filter(({ category }) => category === "ACTIVITY");
  const projects = experiences.filter(({ category }) => category === "PROJECT");

  return (
    <section id="career">
      <SlideUpInView>
        <h2 className="section-eyebrow">{t("eyebrow")}</h2>
        <p className="section-title">{t.rich("title", { br: () => <br /> })}</p>

        {[
          { title: t("groupIntern"), rows: interns },
          { title: t("groupProject"), rows: projects },
          { title: t("groupActivity"), rows: activities },
        ]
          .filter(({ rows }) => rows.length > 0)
          .map(({ title, rows }) => (
            <React.Fragment key={`exp-${title}`}>
              <div className="flex gap-4 items-center md:max-w-[768px] mx-auto mt-12 mb-8">
                <div className="w-full h-px bg-linear-to-l from-foreground/15" />
                <p className="shrink-0 text-xs md:text-sm text-foreground/50">{title}</p>
                <div className="w-full h-px bg-linear-to-r from-foreground/15" />
              </div>

              <div className="flex flex-col gap-8 md:gap-10">
                {rows.map(({ card }) => (
                  <ExpCard key={`exp-${title}-card-${card.id}`} {...card} />
                ))}
              </div>
            </React.Fragment>
          ))}
      </SlideUpInView>
    </section>
  );
}
