import { defaultLocale, localePath, locales } from "@i18n/config";

import content from "@/lib/content";
import { SITE_URL } from "@/lib/site";
import { applyLocaleAll } from "@/utils/localize";

export const dynamic = "force-static";

const languageName = new Intl.DisplayNames(["en"], { type: "language" });

export function GET() {
  const rows = content.project;
  const en = applyLocaleAll(rows, "en");
  const blogEn = applyLocaleAll(content.blog, "en");

  const lines = [
    "# Mingyu Park (박민규) — Backend Developer Portfolio",
    "",
    "> Personal portfolio of Mingyu Park, a backend developer in South Korea.",
    "> Every page is available in the languages below, each at its own URL. URLs without a",
    "> language prefix follow the Accept-Language header and serve Korean when it is absent.",
    "",
    "## Languages",
    "",
    ...locales.map(
      code => `- ${languageName.of(code)}${code === defaultLocale ? " (default)" : ""}: ${SITE_URL}${localePath(code)}`,
    ),
    "",
    "## Pages",
    "",
    `- [Home](${SITE_URL}/): introduction, skills, work experience, awards and activities, projects, ${content.blog.length ? "blog posts, " : ""}education and certifications`,
    `- Each project has a detail page at ${SITE_URL}/project/{id}, with the same language prefixes (for example ${SITE_URL}/en/project/{id})`,
    "",
    "## Projects",
    "",
    ...rows.map((row, i) => {
      const e = en[i];
      const title = row.title === e.title ? row.title : `${row.title} / ${e.title}`;
      return `- [${title}](${SITE_URL}/project/${row.id}): ${e.sub_title || row.sub_title}`;
    }),
    "",
    ...(content.blog.length
      ? [
          "## Blog posts",
          "",
          ...content.blog.map((post, i) => {
            const title = post.title === blogEn[i].title ? post.title : `${post.title} / ${blogEn[i].title}`;
            return `- [${title}](${post.forwardLink}) (${post.date})`;
          }),
          "",
        ]
      : []),
    "## Notes for crawlers",
    "",
    `- Sitemap: ${SITE_URL}/sitemap.xml (every page in every language)`,
    "- Honest AI crawlers and agents (GPTBot, ClaudeBot, Claude-User, ChatGPT-User, OAI-SearchBot, PerplexityBot, CCBot and similar) are welcome to read and cite this site.",
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
