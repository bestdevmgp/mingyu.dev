import FeatureItem from "./FeatureItem";

import type { intro } from "@prisma/client";

interface FeatureItemsProps {
  features: Omit<intro, "i18n">[];
}

const FeatureItems = ({ features }: FeatureItemsProps) => {
  return (
    <ul className="flex flex-col md:flex-row gap-16 md:gap-8 p-0 items-center md:items-start">
      {features.map((feature, index) => (
        <FeatureItem key={`feature-item-${feature.id}`} {...feature} index={index} />
      ))}
    </ul>
  );
};

export default FeatureItems;
