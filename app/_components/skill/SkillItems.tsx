"use client";
import { useState } from "react";

import { Category, skill } from "@prisma/client";
import cn from "classnames";
import { motion, useSpring } from "motion/react";
import { useTranslations } from "next-intl";

import SkillItem from "./SkillItem";

interface SkillItemsProps {
  skills: skill[];
}

const PILL_SPRING = { stiffness: 1500, damping: 78 };
const PILL_GROWTH = 2;

const SkillItems = ({ skills }: SkillItemsProps) => {
  const t = useTranslations("Skill");
  const [activeCategory, setActiveCategory] = useState<string>();
  const [pressedCategory, setPressedCategory] = useState<string | null>(null);
  const releasePress = () => setPressedCategory(null);

  const activeCategoryX = useSpring(0, PILL_SPRING);
  const activeCategoryWidth = useSpring(0, PILL_SPRING);
  const activeCategoryOpacity = useSpring(0, PILL_SPRING);

  const handleCategoryClick = (e: React.MouseEvent, category: Category) => {
    e.preventDefault();

    if (activeCategory === category) {
      setActiveCategory(undefined);
      activeCategoryOpacity.set(0);
    } else {
      setActiveCategory(category);
      activeCategoryOpacity.set(1);
      if (e.currentTarget.parentElement) {
        const targetRect = (e.currentTarget as Element).getBoundingClientRect();
        const containerRect = e.currentTarget.parentElement.getBoundingClientRect();

        const x = targetRect.x - containerRect.x - PILL_GROWTH;
        const width = targetRect.width + PILL_GROWTH * 2;
        activeCategoryX.set(x);
        activeCategoryWidth.set(width);
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 items-center">
      <nav className="bg-gray-100 p-1.5 rounded-full flex items-center gap-[0.5px] relative">
        {[
          { name: t("backend"), value: Category.BACKEND },

          { name: t("devops"), value: Category.DEVOPS },
          { name: t("frontend"), value: Category.FRONTEND },
          { name: t("ai"), value: Category.AI },
        ].map(({ name, value }) => (
          <button
            key={`nav-item-${value}`}
            className={cn(
              "group text-sm sm:text-base font-semibold px-2 sm:px-3 py-1 rounded-full transition-all duration-200 relative",
              "mouse:hover:bg-gray-200 dark:mouse:hover:bg-gray-700/10",
              pressedCategory === value && "bg-gray-200 dark:bg-gray-700/10",
              activeCategory === value ? "text-gray-700 dark:text-gray-100" : "text-gray-400 dark:text-gray-500",
            )}
            onClick={e => handleCategoryClick(e, value)}
            onPointerDown={() => setPressedCategory(value)}
            onPointerUp={releasePress}
            onPointerCancel={releasePress}
            onPointerLeave={releasePress}
            onTouchStart={e => e.stopPropagation()}
            style={{ touchAction: "manipulation" }}
          >
            <span
              className={cn(
                "relative z-10",
                activeCategory !== value && "mouse:group-hover:text-gray-600 dark:mouse:group-hover:text-gray-800",
                activeCategory !== value && pressedCategory === value && "text-gray-600 dark:text-gray-800",
              )}
            >
              {name}
            </span>
          </button>
        ))}
        <motion.div
          className="absolute bg-background z-0 rounded-full top-1 bottom-1 left-0"
          style={{ x: activeCategoryX, width: activeCategoryWidth, opacity: activeCategoryOpacity }}
        />
      </nav>
      <div className="flex flex-wrap gap-4 max-w-96 justify-center">
        {skills.map(skill => (
          <SkillItem
            key={`skill-item-${skill.id}`}
            label={skill.item}
            imageUrl={skill.blobUrl}
            isActive={!activeCategory || activeCategory === skill.category}
            tappable
          />
        ))}
      </div>
    </div>
  );
};

export default SkillItems;
