"use client";

import { FC, PropsWithChildren, createContext, useContext, useState } from "react";

import { motion } from "framer-motion";

// Context
interface SectionWatchContextType {
  activeId: string;
  activate: (sectionId: string) => void;
  deactivate: (sectionId: string) => void;
}
const SectionWatchContext = createContext<SectionWatchContextType>({
  activeId: "",
  activate: () => {},
  deactivate: () => {},
});

export const SectionWatchProvider: FC<PropsWithChildren> = ({ children }) => {
  const [activeId, setActiveId] = useState("");
  const activate = (sectionId: string) => {
    setActiveId(sectionId);
  };
  const deactivate = (sectionId: string) => {
    if (activeId === sectionId) {
      setActiveId("");
    }
  };
  return (
    <SectionWatchContext.Provider value={{ activeId, activate, deactivate }}>{children}</SectionWatchContext.Provider>
  );
};

export const useSectionWatch = () => {
  const context = useContext(SectionWatchContext);
  if (!context) {
    throw new Error("useSectionWatch must be used within SectionWatchProvider");
  }
  return context;
};

// Component
interface SectionWatcherProps extends Omit<PropsWithChildren, "id"> {
  id: string;
}

const SectionWatcher: FC<SectionWatcherProps> = ({ id, children, ...props }) => {
  const { activate, deactivate } = useSectionWatch();
  const handleOnViewportEnter = () => {
    activate(id);
  };
  const handleOnViewportLeave = () => {
    deactivate(id);
  };

  return (
    <motion.section
      id={id}
      {...props}
      viewport={{ margin: "-30% 0px -30% 0px" }}
      onViewportEnter={handleOnViewportEnter}
      onViewportLeave={handleOnViewportLeave}
    >
      {children}
    </motion.section>
  );
};

export default SectionWatcher;
