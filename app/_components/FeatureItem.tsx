import Image from "next/image";

import richText from "@/utils/richText";

import type { intro } from "@prisma/client";

interface FeatureItemProps extends Omit<intro, "i18n"> {
  index: number;
}

const FeatureItem = ({ imageUrl, title, detail, index }: FeatureItemProps) => {
  return (
    <li
      data-reveal-stagger
      style={{ "--reveal-index": index } as React.CSSProperties}
      className="flex flex-col gap-4 flex-1 indent-0 max-w-80"
    >
      {imageUrl && (
        <div className="relative w-full h-60 md:overflow-hidden md:rounded-lg md:shadow-[0_0_0_1px_rgba(0,0,0,0.05)]">
          <Image
            className="bg-foreground/5 dark:bg-foreground/8 rounded-lg shadow-[0_0_0_1px_rgba(0,0,0,0.05)] object-cover object-center md:object-contain md:scale-[1.0455]"
            src={imageUrl}
            fill
            sizes="320px"
            alt=""
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
