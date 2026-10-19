"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import cn from "classnames";
import { motion, useSpring } from "motion/react";
import { useTranslations } from "next-intl";

import useCarriedState from "@/utils/useCarriedState";

import SkillItem from "./SkillItem";

import type { skill } from "@prisma/client";

interface SkillItemsProps {
  skills: skill[];
}

const CATEGORY = { BACKEND: "BACKEND", DEVOPS: "DEVOPS", FRONTEND: "FRONTEND", AI: "AI" } as const;
type Category = (typeof CATEGORY)[keyof typeof CATEGORY];

const PILL_SPRING = { stiffness: 1500, damping: 78 };
const PILL_GROWTH = 2;

const pillBox = (button: Element, container: Element) => {
  const targetRect = button.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  return { x: targetRect.x - containerRect.x - PILL_GROWTH, width: targetRect.width + PILL_GROWTH * 2 };
};

const SkillItems = ({ skills }: SkillItemsProps) => {
  const t = useTranslations("Skill");
  const [activeCategory, setActiveCategory] = useCarriedState<string | undefined>("skills.category", undefined);
  const [pressedCategory, setPressedCategory] = useState<string | null>(null);
  const releasePress = () => setPressedCategory(null);

  const activeCategoryX = useSpring(0, PILL_SPRING);
  const activeCategoryWidth = useSpring(0, PILL_SPRING);
  const activeCategoryOpacity = useSpring(0, PILL_SPRING);

  const navRef = useRef<HTMLElement>(null);
  const restoredCategory = useRef(activeCategory);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const markSelection = () => {
      const label = nav.querySelector('[aria-pressed="true"] > span');
      const selection = document.getSelection();
      nav.toggleAttribute(
        "data-selecting",
        Boolean(label && selection && !selection.isCollapsed && selection.containsNode(label, true)),
      );
    };
    document.addEventListener("selectionchange", markSelection);
    return () => document.removeEventListener("selectionchange", markSelection);
  }, []);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav || !restoredCategory.current) return;

    const place = () => {
      const button = nav.querySelector(`[data-category="${restoredCategory.current}"]`);
      if (!button) return;
      const { x, width } = pillBox(button, nav);
      activeCategoryX.jump(x);
      activeCategoryWidth.jump(width);
      activeCategoryOpacity.jump(1);
    };

    place();
    document.fonts?.addEventListener("loadingdone", place);
    return () => document.fonts?.removeEventListener("loadingdone", place);
  }, [activeCategoryX, activeCategoryWidth, activeCategoryOpacity]);

  const handleCategoryClick = (e: React.MouseEvent, category: Category) => {
    e.preventDefault();
    restoredCategory.current = undefined;

    if (activeCategory === category) {
      setActiveCategory(undefined);
      activeCategoryOpacity.set(0);
    } else {
      const appearing = activeCategory === undefined;
      setActiveCategory(category);
      activeCategoryOpacity.set(1);
      if (e.currentTarget.parentElement) {
        const { x, width } = pillBox(e.currentTarget, e.currentTarget.parentElement);
        if (appearing) {
          activeCategoryX.jump(x);
          activeCategoryWidth.jump(width);
        } else {
          activeCategoryX.set(x);
          activeCategoryWidth.set(width);
        }
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 items-center">
      <nav
        ref={navRef}
        className="bg-gray-100 p-1.5 rounded-full flex items-center relative dark:[--focus-ring:rgb(34,34,34)]"
      >
        {[
          { name: t("backend"), value: CATEGORY.BACKEND },

          { name: t("devops"), value: CATEGORY.DEVOPS },
          { name: t("frontend"), value: CATEGORY.FRONTEND },
          { name: t("ai"), value: CATEGORY.AI },
        ].map(({ name, value }) => (
          <button
            key={`nav-item-${value}`}
            data-category={value}
            aria-pressed={activeCategory === value}
            className={cn(
              "group text-sm sm:text-base font-semibold px-2 sm:px-3 py-1 rounded-full transition-all duration-200 relative focus-visible:z-10",
              "text-gray-400 dark:text-gray-500",
              activeCategory === value
                ? "outline-offset-1"
                : "-outline-offset-1 mouse:hover:bg-gray-200 dark:mouse:hover:bg-gray-700/10",
              activeCategory !== value && pressedCategory === value && "bg-gray-200 dark:bg-gray-700/10",
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
                "relative z-10 mouse:group-hover:text-gray-600 dark:mouse:group-hover:text-gray-800",
                activeCategory === value
                  ? "[-webkit-text-fill-color:var(--color-gray-700)] dark:[-webkit-text-fill-color:var(--color-gray-100)]"
                  : "transition-colors duration-200",
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
