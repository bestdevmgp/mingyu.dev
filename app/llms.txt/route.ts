import { defaultLocale, localePath, locales } from "@i18n/config";

import prisma, { CACHE_STRATEGY } from "@/lib/prisma";
import { applyLocaleAll } from "@/utils/localize";

export const revalidate = 3600;

const languageName = new Intl.DisplayNames(["en"], { type: "language" });

export async function GET() {
  const rows = await prisma.project.findMany({
    select: { id: true, title: true, sub_title: true, i18n: true },
    orderBy: { row_number: "asc" },
    cacheStrategy: CACHE_STRATEGY,
  });
  const ko = applyLocaleAll(rows, "ko");
  const en = applyLocaleAll(rows, "en");

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
      code =>
        `- ${languageName.of(code) ?? code}${code === defaultLocale ? " (default)" : ""}: https://mingyu.dev${localePath(code)}`,
    ),
    "",
    "## Pages",
    "",
    "- [Home](https://mingyu.dev/): introduction, skills, work experience, awards and activities, projects, education",
    "- Each project has a detail page at https://mingyu.dev/project/{id}, with the same language prefixes (for example https://mingyu.dev/en/project/{id})",
    "",
    "## Projects",
    "",
    ...rows.map((row, i) => {
      const k = ko[i];
      const e = en[i];
      const title = k.title === e.title ? k.title : `${k.title} / ${e.title}`;
      return `- [${title}](https://mingyu.dev/project/${row.id}): ${e.sub_title || k.sub_title}`;
    }),
    "",
    "## Notes for crawlers",
    "",
    "- Sitemap: https://mingyu.dev/sitemap.xml (every page in every language)",
    "- Honest AI crawlers and agents (GPTBot, ClaudeBot, Claude-User, ChatGPT-User, OAI-SearchBot, PerplexityBot, CCBot and similar) are welcome to read and cite this site.",
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
