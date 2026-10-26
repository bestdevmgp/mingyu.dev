import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { languageAlternates, localePath } from "@i18n/config";

import SiteHeader from "@/_components/SiteHeader";
import ProjectModalClient from "@/_components/project/ProjectModalClient";
import { getNavSections, getProjectIds } from "@/utils/api";
import { getProjectData } from "@/utils/projectData";
import { stripTags } from "@/utils/richText";

import HomeButton from "./HomeButton";

import type { Metadata, ResolvingMetadata } from "next";

type ProjectParams = { params: Promise<{ id: string; locale: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjectIds().map(id => ({ id }));
}

export async function generateMetadata({ params }: ProjectParams, parent: ResolvingMetadata): Promise<Metadata> {
  const { id, locale } = await params;
  const project = getProjectData(Number(id), locale);
  if (!project) return {};

  const name = stripTags(project.title);
  const summary = stripTags(project.sub_title);
  const path = `/project/${id}`;
  const photo = project.items.find(item => item.imageUrls.length)?.imageUrls[0];
  const size = photo ? project.imageSizes[photo] : undefined;
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
    <>
      <SiteHeader sections={getNavSections()} homeHref={localePath(locale)} />
      <main className="w-full md:w-[calc(100vw-4rem)] md:max-w-4xl mx-auto px-4 md:px-[33px] pt-22 pb-8 md:pt-26 md:pb-12">
        <ProjectModalClient id={Number(id)} projectData={projectData} />
        <HomeButton />
      </main>
    </>
  );
}
