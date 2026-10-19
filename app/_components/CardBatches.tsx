"use client";

import { Children, useLayoutEffect, useState } from "react";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";

import useCarriedState from "@/utils/useCarriedState";

import CTAButton from "./buttons/CTAButton";

const BATCH_SIZE = 6;

const checkedKeys = new Set<string>();

const savedCount = (key: string) => {
  if (checkedKeys.has(key)) return 0;
  checkedKeys.add(key);
  try {
    const [entry] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    if (entry?.type === "reload" || entry?.type === "back_forward") return Number(sessionStorage.getItem(key)) || 0;
    sessionStorage.removeItem(key);
  } catch {}
  return 0;
};

interface CardBatchesProps {
  carryKey: string;
  showMoreAnalytics: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

const CardBatches = ({ carryKey, showMoreAnalytics, action, children }: CardBatchesProps) => {
  const t = useTranslations("Common");
  const cards = Children.toArray(children);
  const [shownCount, setShownCount] = useCarriedState(carryKey, BATCH_SIZE);
  const [restoredCount, setRestoredCount] = useState(shownCount);
  const [openedBatches, setOpenedBatches] = useState<number[]>([]);
  const hasNext = shownCount < cards.length;

  /* eslint-disable react-hooks/set-state-in-effect */
  useLayoutEffect(() => {
    const saved = savedCount(carryKey);
    if (saved <= BATCH_SIZE) return;
    setShownCount(count => Math.max(count, saved));
    setRestoredCount(count => Math.max(count, saved));
  }, [carryKey, setShownCount]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const showMore = () => {
    if (!hasNext) return;
    const next = shownCount + BATCH_SIZE;
    setShownCount(next);
    try {
      sessionStorage.setItem(carryKey, String(next));
    } catch {}
  };

  const batchStarts: number[] = [];
  for (let start = BATCH_SIZE; start < shownCount; start += BATCH_SIZE) batchStarts.push(start);

  return (
    <div className="cards flex flex-col">
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">{cards.slice(0, BATCH_SIZE)}</div>

      {batchStarts.map((start, index) => {
        const restored = BATCH_SIZE * (index + 1) < restoredCount;
        return (
          <motion.div
            key={`batch-${start}`}
            className={restored || openedBatches.includes(start) ? undefined : "overflow-hidden"}
            initial={restored ? false : { height: 0 }}
            animate={{ height: "auto" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={() => setOpenedBatches(starts => [...starts, start])}
          >
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 pt-6 md:pt-8">
              {cards.slice(start, start + BATCH_SIZE)}
            </div>
          </motion.div>
        );
      })}

      {(hasNext || action) && (
        <div className="flex justify-center gap-3 pt-6 md:pt-8">
          {hasNext && <CTAButton label={t("showMore")} onClick={showMore} data-analytics={showMoreAnalytics} />}
          {action}
        </div>
      )}
    </div>
  );
};

export default CardBatches;
