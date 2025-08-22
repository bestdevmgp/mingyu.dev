import { intro } from "@prisma/client";
import { motion, MotionProps } from "framer-motion";
import parse from "html-react-parser";
import Image from "next/image";

interface FeatureItemProps extends intro, MotionProps {}

const FeatureItem = ({ id, blobUrl, title, detail, ...props }: FeatureItemProps) => {
  return (
    <motion.li key={`intro-card-${id}`} className="flex flex-col gap-4 flex-1 indent-0 max-w-80" {...props}>
      {blobUrl && (
        <div className="relative w-full h-60 ">
          <Image
            className="bg-foreground/5 dark:bg-foreground/[0.08] rounded-lg shadow-[0_0_0_1px_rgba(0,0,0,0.05)] object-cover object-center"
            src={blobUrl}
            fill
            alt={`feature-${title}`}
          />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <p className="text-lg md:text-xl font-semibold">{title}</p>
        <p className="text-sm font-normal leading-normal text-foreground/60">{parse(detail)}</p>
      </div>
    </motion.li>
  );
};

export default FeatureItem;
