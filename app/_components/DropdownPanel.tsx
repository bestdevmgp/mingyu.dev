"use client";

import cn from "classnames";
import { AnimatePresence, motion } from "motion/react";

import arrowFocus from "@/utils/arrowFocus";

const PANELS = { ul: motion.ul, div: motion.div };

interface DropdownPanelProps {
  as: keyof typeof PANELS;
  isOpen: boolean;
  role: "listbox" | "menu";
  label?: string;
  itemSelector: string;
  className: string;
  children: React.ReactNode;
}

const DropdownPanel = ({ as, isOpen, role, label, itemSelector, className, children }: DropdownPanelProps) => {
  const Panel = PANELS[as];

  return (
    <AnimatePresence>
      {isOpen && (
        <Panel
          role={role}
          aria-label={label}
          onKeyDown={arrowFocus(itemSelector)}
          initial={{ opacity: 0, y: -4, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.96 }}
          transition={{ type: "spring", bounce: 0, duration: 0.2 }}
          style={{ transformOrigin: "top right" }}
          className={cn(
            "absolute right-[-2px] top-full mt-2 p-1 rounded-xl bg-background border border-foreground/10 shadow-lg shadow-black/5 z-50",
            className,
          )}
        >
          {children}
        </Panel>
      )}
    </AnimatePresence>
  );
};

export default DropdownPanel;
