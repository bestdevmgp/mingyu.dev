import { ExternalLink } from "react-feather";

import { getLocale, getTranslations } from "next-intl/server";

import BlogCard from "@/_components/BlogCard";
import CardBatches from "@/_components/CardBatches";
import SlideUpInView from "@/_components/SlideUpInView";
import CTAButton from "@/_components/buttons/CTAButton";
import content from "@/lib/content";
import { applyLocaleAll } from "@/utils/localize";

const BLOG_LINK = "https://velog.io/@bestdevmgp";

export default async function BlogSection() {
  if (!content.blog.length) return null;

  const locale = await getLocale();
  const t = await getTranslations("Blog");
  const blogs = applyLocaleAll(content.blog, locale);

  return (
    <section id="blog">
      <SlideUpInView>
        <h2 className="section-eyebrow">{t("eyebrow")}</h2>
        <p className="section-title">{t.rich("title", { br: () => <br /> })}</p>

        <CardBatches
          carryKey="blog.shown"
          showMoreAnalytics="blog_show_more"
          action={
            <CTAButton
              label={t("cta")}
              prefix={<ExternalLink className="w-4 h-4" strokeWidth={2.25} />}
              link={BLOG_LINK}
              data-analytics="blog_cta"
            />
          }
        >
          {blogs.map(({ id, title, date, forwardLink, bgImageUrl }) => (
            <BlogCard
              key={`blog-card-${id}`}
              id={id}
              title={title}
              date={date}
              forwardLink={forwardLink}
              bgImageUrl={bgImageUrl}
            />
          ))}
        </CardBatches>
      </SlideUpInView>
    </section>
  );
}
