import { getTranslations, setRequestLocale } from "next-intl/server";

import { languageAlternates, localePath } from "@i18n/config";

import ProjectModal from "@/_components/project/ProjectModal";
import prisma, { CACHE_STRATEGY } from "@/lib/prisma";
import { getProjectIds } from "@/utils/api";
import { applyLocale, applyLocaleAll } from "@/utils/localize";

import HomeButton from "./HomeButton";

import type { Metadata, ResolvingMetadata } from "next";

const plain = (value: string) => value.replace(/<[^>]+>/g, "").trim();

async function getFirstPhoto(projectId: number, locale: string) {
  const items = applyLocaleAll(
    await prisma.projectItem.findMany({
      where: { projectId },
      orderBy: { row_number: "asc" },
      select: { blobUrls: true, i18n: true },
      cacheStrategy: CACHE_STRATEGY,
    }),
    locale,
  );
  return items.find(item => item.blobUrls?.length)?.blobUrls[0];
}

type ProjectParams = { params: Promise<{ id: string; locale: string }> };

export const revalidate = 3600;
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getProjectIds()).map(id => ({ id }));
}

export async function generateMetadata({ params }: ProjectParams, parent: ResolvingMetadata): Promise<Metadata> {
  const { id, locale } = await params;
  const row = await prisma.project.findUnique({ where: { id: Number(id) }, cacheStrategy: CACHE_STRATEGY });
  if (!row) return {};

  const { title, sub_title } = applyLocale(row, locale);
  const name = plain(title);
  const summary = plain(sub_title);
  const path = `/project/${id}`;
  const photo = await getFirstPhoto(row.id, locale);
  const { openGraph: site } = await parent;
  const t = await getTranslations({ locale, namespace: "Meta" });

  return {
    title: name,
    description: summary,
    alternates: { canonical: localePath(locale, path), languages: languageAlternates(path) },
    openGraph: {
      siteName: t("title"),
      locale: site?.locale,
      type: "website",
      title: name,
      description: summary,
      url: localePath(locale, path),
      images: photo ? [{ url: photo, alt: name }] : site?.images,
    },
  };
}

export default async function ProjectPage({ params }: ProjectParams) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="w-full md:w-[540px] mx-auto px-4 py-8 md:py-12">
      <ProjectModal id={Number(id)} />
      <HomeButton />
    </div>
  );
}
