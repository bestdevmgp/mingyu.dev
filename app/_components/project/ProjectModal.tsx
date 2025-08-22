import cn from "classnames";
import parse from "html-react-parser";
import Image from "next/image";
import Link from "next/link";

import prisma from "@/lib/prisma";
import { getSkills } from "@/utils/api";
import { parsePrismaJSON } from "@/utils/parsePrisma";

import SkillItem from "../skill/SkillItem";

interface ProjectModalProps {
  id: number;
}

async function getProjectById(id: number) {
  const responseProject = await prisma.project.findUniqueOrThrow({ where: { id } });
  const responseItems = await prisma.projectItem.findMany({ where: { projectId: id }, orderBy: { row_number: "asc" } });

  const { links, skill_ids, ...res } = responseProject;
  const responseSkills = await getSkills(skill_ids);

  return {
    ...res,
    links: links.map(link => parsePrismaJSON<{ href: string; label: string }>(link)),
    items: responseItems,
    skills: responseSkills,
  };
}

export default async function ProjectModal({ id }: ProjectModalProps) {
  const { title, sub_title, member, period, skills, links, items } = await getProjectById(id);

  const skillsElement = (
    <ul className="p-0 flex gap-2 list-none flex-wrap">
      {skills.map(({ id, item, blobUrl }) => (
        <li key={`project-info-skill-${id}`} className="indent-0">
          <SkillItem size="xs" label={item} imageUrl={blobUrl} />
        </li>
      ))}
    </ul>
  );

  const linksElement = (
    <div className="flex gap-2">
      {links.map(({ href, label }) => (
        <Link key={`link-${label}`} href={href}>
          {label}
        </Link>
      ))}
    </div>
  );

  return (
    <>
      <div id="project-modal-header" className="flex flex-col gap-3 md:gap-6">
        <div className="relative w-8 md:w-12 h-8 md:h-12">
          <Image className="object-contain" src={`/assets/shape-variant-${id % 9}.svg`} fill alt="shape" />
        </div>

        <p className="text-xl md:text-2xl font-semibold leading-normal break-keep mb-4">{parse(title)}</p>

        <div className="flex gap-6 flex-wrap">
          {[
            { title: "프로젝트 설명", content: parse(sub_title), isFull: true },
            {
              title: "기술 스택",
              content: skillsElement,
              isFull: true,
            },
            { title: "참여인원", content: member },
            { title: "기간", content: period },
            ...(links.length ? [{ title: "관련 링크", content: linksElement }] : []),
          ].map(({ title, content, isFull }) => (
            <div key={`project-info-${title}`} className={cn("flex flex-col gap-1", isFull && "w-full")}>
              <p className="text-sm font-medium text-foreground/50">{title}</p>
              <div className="text-sm font-semibold text-foreground/80">{content}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full h-[1px] min-h-[1px] bg-foreground/10 my-10 md:my-12" />

      <div id="project-modal-content" className="text-sm md:text-base flex flex-col gap-2">
        <p className="font-semibold text-base md:text-lg">상세 내용</p>
        <ol className="list-decimal break-keep">
          {items.map((item, index) => (
            <li key={`project-item-${index}`} className="mb-6 md:mb-8 last:mb-0">
              <span>{item.title}</span>
              <div className="w-0.5 h-2" />
              {item.content && (
                <ul className="text-foreground/80 marker:text-foreground/60">
                  {item.content.map((text, contentIndex) => (
                    <li key={`project-desc-${index}-${contentIndex}`} className="mb-1 last:mb-0">
                      {text}
                    </li>
                  ))}
                </ul>
              )}
              {item.blobUrls && item.blobUrls.length > 0 && (
                <div className="flex flex-col gap-4 mt-4">
                  {item.blobUrls.map((imageUrl, imgIndex) => (
                    <div key={`project-image-${index}-${imgIndex}`} className="w-full">
                      <Image
                        className="w-full h-auto object-contain"
                        src={imageUrl}
                        alt={`${item.title} ${imgIndex + 1}`}
                        width={800}
                        height={600}
                        style={{ maxWidth: "100%", height: "auto" }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
