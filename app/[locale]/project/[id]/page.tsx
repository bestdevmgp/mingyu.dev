import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { languageAlternates, localePath } from "@i18n/config";

import ProjectModalClient from "@/_components/project/ProjectModalClient";
import { getImageSizes, getProject, getProjectIds } from "@/utils/api";
import { applyLocale, applyLocaleAll } from "@/utils/localize";
import { getProjectData } from "@/utils/projectData";

import HomeButton from "./HomeButton";

import type { Metadata, ResolvingMetadata } from "next";

const plain = (value: string) => value.replace(/<[^>]+>/g, "").trim();

type ProjectParams = { params: Promise<{ id: string; locale: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjectIds().map(id => ({ id }));
}

export async function generateMetadata({ params }: ProjectParams, parent: ResolvingMetadata): Promise<Metadata> {
  const { id, locale } = await params;
  const row = getProject(Number(id));
  if (!row) return {};

  const { title, sub_title, ProjectItem: items } = applyLocale(row, locale);
  const name = plain(title);
  const summary = plain(sub_title);
  const path = `/project/${id}`;
  const photo = applyLocaleAll(items, locale).find(item => item.blobUrls.length)?.blobUrls[0];
  const size = photo ? getImageSizes([photo])[photo] : undefined;
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
      images: photo ? [{ url: photo, alt: name, width: size?.[0], height: size?.[1] }] : site?.images,
    },
  };
}

export default async function ProjectPage({ params }: ProjectParams) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const projectData = getProjectData(Number(id), locale);
  if (!projectData) notFound();

  return (
    <div className="w-full md:w-[calc(100vw-4rem)] md:max-w-4xl mx-auto px-4 md:px-[33px] py-8 md:py-12">
      <ProjectModalClient id={Number(id)} projectData={projectData} />
      <HomeButton />
    </div>
  );
}
