import cn from "classnames";
import Image from "next/image";

type Size = "xs" | "md";
interface SkillItemProps {
  size?: Size;
  label: string;
  imageUrl: string;
  isActive?: boolean;
  tappable?: boolean;
}

const SkillItem = ({ size = "md", label, imageUrl, isActive = true, tappable = false }: SkillItemProps) => {
  const isRawImage = imageUrl.includes("raw");
  const rounded = size === "md" ? "rounded-lg" : "rounded-md";
  const canTap = tappable && isActive;

  return (
    <div
      data-skill={canTap ? "" : undefined}
      style={{ WebkitTouchCallout: "none" }}
      className={cn(
        "relative group/skill transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center select-none",
        rounded,
        isRawImage ? "p-0" : "bg-white border border-gray-100 p-1",
        canTap && "cursor-pointer",

        size === "md" && "w-12 h-12",
        size === "xs" && "w-7 h-7",
        !isActive && "opacity-15 blur-md",
      )}
    >
      {imageUrl ? (
        <Image
          draggable={false}
          className={cn(
            "pointer-events-none",
            isRawImage ? cn("object-cover w-full h-full", rounded) : "object-contain",
          )}
          width={size === "md" ? 36 : 26}
          height={size === "md" ? 36 : 26}
          src={imageUrl}
          alt={label}
        />
      ) : (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none font-semibold text-gray-400 select-none",
            size === "md" ? "text-base" : "text-[11px]",
          )}
        >
          {label.charAt(0).toUpperCase()}
        </span>
      )}
      <p
        className={cn(
          "skill-label absolute -bottom-1 translate-y-full left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-foreground/75 text-background rounded-sm text-xs md:text-sm text-center whitespace-nowrap font-normal z-10",
          "invisible",
          isActive && "mouse:group-hover/skill:visible",
        )}
      >
        {label}
      </p>
    </div>
  );
};

export default SkillItem;
