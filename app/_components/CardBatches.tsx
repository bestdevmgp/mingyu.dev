"use client";

import { Children, useLayoutEffect, useState } from "react";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";

import navigationType from "@/utils/navigationType";
import useCarriedState from "@/utils/useCarriedState";

import CTAButton from "./buttons/CTAButton";

const BATCH_SIZE = 6;
const STORAGE_PREFIX = "cardBatches:";

const checkedKeys = new Set<string>();

const savedBatches = (key: string) => {
  if (checkedKeys.has(key)) return 0;
  checkedKeys.add(key);
  try {
    const type = navigationType();
    if (type === "reload" || type === "back_forward") return Number(sessionStorage.getItem(STORAGE_PREFIX + key)) || 0;
    sessionStorage.removeItem(STORAGE_PREFIX + key);
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
    const saved = BATCH_SIZE * (savedBatches(carryKey) + 1);
    if (saved <= BATCH_SIZE) return;
    setShownCount(count => Math.max(count, saved));
    setRestoredCount(count => Math.max(count, saved));
  }, [carryKey, setShownCount]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const showMore = () => {
    const next = shownCount + BATCH_SIZE;
    setShownCount(next);
    try {
      sessionStorage.setItem(STORAGE_PREFIX + carryKey, String(next / BATCH_SIZE - 1));
    } catch {}
  };

  const batchStarts: number[] = [];
  for (let start = BATCH_SIZE; start < cards.length; start += BATCH_SIZE) batchStarts.push(start);

  return (
    <div className="cards flex flex-col" data-carry={carryKey}>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">{cards.slice(0, BATCH_SIZE)}</div>

      {batchStarts.map(start => {
        const grid = (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 pt-6 md:pt-8">
            {cards.slice(start, start + BATCH_SIZE)}
          </div>
        );
        if (start >= shownCount)
          return (
            <div key={`batch-${start}`} data-batch={start / BATCH_SIZE} className="hidden">
              {grid}
            </div>
          );
        if (start < restoredCount) return <div key={`batch-${start}`}>{grid}</div>;
        return (
          <motion.div
            key={`batch-${start}`}
            className={openedBatches.includes(start) ? undefined : "overflow-hidden"}
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={() => setOpenedBatches(starts => [...starts, start])}
          >
            {grid}
          </motion.div>
        );
      })}

      {(hasNext || action) && (
        <div
          className="flex justify-center gap-3 pt-6 md:pt-8"
          data-show-more={action ? undefined : batchStarts.length}
        >
          {hasNext && (
            <CTAButton
              label={t("showMore")}
              onClick={showMore}
              data-analytics={showMoreAnalytics}
              data-show-more={action ? batchStarts.length : undefined}
            />
          )}
          {action}
        </div>
      )}
    </div>
  );
};

export default CardBatches;
