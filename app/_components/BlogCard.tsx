"use client";

import { ArrowUpRight } from "react-feather";

import Image from "next/image";
import { useTranslations } from "next-intl";

import CardFrame from "./CardFrame";
import { track } from "./analytics/posthog";

const CARD_SIZES =
  "(min-width: 1280px) 294px, (min-width: 1024px) 456px, (min-width: 768px) calc(50vw - 48px), calc(100vw - 40px)";

interface BlogCardProps {
  id: number;
  title: string;
  date: string;
  forwardLink: string;
  bgImageUrl: string;
}

const BlogCard = ({ id, title, date, forwardLink, bgImageUrl }: BlogCardProps) => {
  const t = useTranslations("Blog");

  return (
    <CardFrame
      href={forwardLink}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("blog_post_opened", { post_id: id, post_title: title })}
      boxClassName="relative overflow-hidden transition-[scale] duration-200"
    >
      <Image className="object-cover" src={bgImageUrl} alt="" fill sizes={CARD_SIZES} />
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] group-hover:backdrop-blur-sm transition-[backdrop-filter] duration-200" />

      <div className="relative z-10 flex flex-col md:h-full">
        <p className="text-white text-lg md:text-xl font-semibold mb-10 md:mb-4">{title}</p>

        <div className="text-white/60 text-xs md:text-sm font-normal flex justify-between md:flex-col md:grow">
          <p>{date}</p>
          <div className="flex gap-1 items-center">
            <p>{t("readMore")}</p>
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          </div>
        </div>
      </div>
    </CardFrame>
  );
};

export default BlogCard;
