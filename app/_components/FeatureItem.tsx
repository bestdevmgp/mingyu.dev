import Image from "next/image";

import richText from "@/utils/richText";

import type { intro } from "@prisma/client";

interface FeatureItemProps extends Omit<intro, "i18n"> {
  index: number;
}

const FeatureItem = ({ id, blobUrl, title, detail, index }: FeatureItemProps) => {
  return (
    <li
      key={`intro-card-${id}`}
      data-reveal-stagger
      style={{ "--reveal-index": index } as React.CSSProperties}
      className="flex flex-col gap-4 flex-1 indent-0 max-w-80"
    >
      {blobUrl && (
        <div className="relative w-full h-60 ">
          <Image
            className="bg-foreground/5 dark:bg-foreground/8 rounded-lg shadow-[0_0_0_1px_rgba(0,0,0,0.05)] object-cover object-center"
            src={blobUrl}
            fill
            alt={`feature-${title}`}
          />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <p className="text-lg md:text-xl font-semibold">{title}</p>
        <p className="text-sm font-normal leading-normal text-foreground/60">{richText(detail)}</p>
      </div>
    </li>
  );
};

export default FeatureItem;
