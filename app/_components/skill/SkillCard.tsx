import cn from "classnames";

interface SkillCardProps {
  color: "blue" | "green" | "lime" | "gray";
  renderShape: (options: { className: string }) => React.ReactNode;
  title: string;
  items: string[];
}

const SkillCard = ({ color, renderShape, title, items }: SkillCardProps) => {
  return (
    <div className="w-full flex flex-col gap-4 md:grid md:grid-cols-[128px_auto] md:items-start">
      <div className="flex items-center gap-2">
        {renderShape({
          className: cn(
            "w-4 h-4",
            color === "blue" && "text-blue",
            color === "green" && "text-green",
            color === "lime" && "text-lime",
            color === "gray" && "text-gray-400 dark:text-gray-500",
          ),
        })}
        <p className="text-sm md:text-base text-foreground/60 font-semibold">{title}</p>
      </div>

      <ul className="list-disc list-inside -indent-5 pl-6">
        {items.map((item, index) => (
          <li key={`skill-${title}-${index}`} className="text-sm md:text-base font-normal mb-1 last:mb-0">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SkillCard;
