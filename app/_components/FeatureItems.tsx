"use client";

import { useEffect } from "react";

import { intro } from "@prisma/client";
import { stagger, useAnimate, useInView } from "framer-motion";

import FeatureItem from "./FeatureItem";

interface FeatureItemsProps {
  features: intro[];
}

const staggerMenuItems = stagger(0.2, { startDelay: 0.1 });

const FeatureItems = ({ features }: FeatureItemsProps) => {
  const [scope, animate] = useAnimate();
  const isInView = useInView(scope, { margin: "-180px" });

  useEffect(() => {
    if (isInView) {
      animate("li", { opacity: 1, y: 0 }, { duration: 0.6, delay: staggerMenuItems, ease: "easeOut" });
    }
  }, [isInView, animate]);

  return (
    <ul className="flex flex-col md:flex-row gap-16 md:gap-8 p-0 items-center md:items-start" ref={scope}>
      {features.map(feature => (
        <FeatureItem key={`feature-item-${feature.id}`} {...feature} style={{ opacity: 0, y: 100 }} />
      ))}
    </ul>
  );
};

export default FeatureItems;
