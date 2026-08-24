import prisma, { CACHE_STRATEGY } from "@/lib/prisma";
import { applyLocaleAll } from "@/utils/localize";

export const revalidate = 3600;

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
    "> Content is served in Korean by default and also available in English,",
    "> Japanese, Simplified Chinese and Traditional Chinese (negotiated via the",
    "> Accept-Language header or the NEXT_LOCALE cookie).",
    "",
    "## Pages",
    "",
    "- [Home](https://mingyu.dev/): introduction, skills, work experience, awards and activities, projects, education",
    "- Each project has a detail page at https://mingyu.dev/project/{id}",
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
    "- Sitemap: https://mingyu.dev/sitemap.xml",
    "- Honest AI crawlers and agents (GPTBot, ClaudeBot, Claude-User, ChatGPT-User, OAI-SearchBot, PerplexityBot, CCBot and similar) are welcome to read and cite this site.",
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
