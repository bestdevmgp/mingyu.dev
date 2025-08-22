import cn from "classnames";
import Image from "next/image";

type Size = "xs" | "sm" | "md";
interface SkillItemProps {
  size?: Size;
  label: string;
  imageUrl: string;
  isActive?: boolean;
}

const mediaQueries: Record<Size, { min: number; max: number }> = {
  xs: {
    min: 375,
    max: 640,
  },
  sm: {
    min: 640,
    max: 768,
  },
  md: {
    min: 768,
    max: 9999,
  },
};

const itemWidths: Record<Size, number> = {
  xs: 24,
  sm: 32,
  md: 48,
};

const generateSizeSet = (size: Size) => {
  const viewWidths = Object.entries(mediaQueries).map<[Size, number]>(([key, { min }]) => [
    key as Size,
    Math.ceil((itemWidths[size] / min) * 100),
  ]);

  return viewWidths
    .map(([key, value], index) => {
      if (index === viewWidths.length - 1) {
        return `${value}vw`;
      }
      const max = mediaQueries[key].max;
      return `(max-width: ${max}px) ${value}vw`;
    })
    .join(", ");
};

const SkillItem = ({ size = "md", label, imageUrl, isActive = true }: SkillItemProps) => {
  const isRawImage = imageUrl.includes('raw');
  
  return (
    <div
      className={cn(
        "relative group/skill transition-all rounded-lg shadow-xl hover:shadow-2xl flex items-center justify-center",
        isRawImage ? "p-0" : "bg-white border border-gray-100 p-1",
        size === "md" && "w-12 h-12",
        size === "sm" && "w-9 h-9", 
        size === "xs" && "w-7 h-7",
        !isActive && "opacity-15 blur-md",
      )}
    >
      <Image
        className={isRawImage ? "object-cover w-full h-full rounded-lg" : "object-contain"}
        width={size === "md" ? 36 : size === "sm" ? 34 : 26}
        height={size === "md" ? 36 : size === "sm" ? 34 : 26}
        src={imageUrl}
        alt={label}
      />
      <p
        className={cn(
          "absolute -bottom-1 translate-y-full left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-foreground/75 text-background rounded text-xs md:text-sm text-center whitespace-nowrap font-normal invisible z-10",
          isActive && "group-hover/skill:visible",
        )}
      >
        {label}
      </p>
    </div>
  );
};

export default SkillItem;
