"use client";

import { useState } from "react";
import type { Ref } from "react";

import cn from "classnames";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";

interface ProjectImageProps {
  ref: Ref<HTMLImageElement>;
  className: string;
  src: string;
  alt: string;
  size?: [number, number];
  sizes: string;
  reveal: boolean;
  onClick: () => void;
}

const FADE_SECONDS = 0.3;

const settledSources = new Set<string>();

const ProjectImage = ({ ref, className, src, alt, size, sizes, reveal, onClick }: ProjectImageProps) => {
  const [loaded, setLoaded] = useState(() => settledSources.has(src));
  const settle = () => {
    settledSources.add(src);
    setLoaded(true);
  };

  return (
    <div className={cn("relative", className)} onErrorCapture={settle}>
      <AnimatePresence>
        {!loaded && (
          <motion.div
            key="image-skeleton"
            className="absolute inset-0"
            exit={{ opacity: 0 }}
            transition={{ duration: 0, delay: reveal ? FADE_SECONDS : 0 }}
          >
            <div className="skeleton-bar bg-foreground/10 rounded-sm h-full" />
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={cn("relative transition-opacity ease-out", reveal && !loaded && "opacity-0")}
        style={{ transitionDuration: `${FADE_SECONDS}s` }}
      >
        <Image
          ref={ref}
          className="w-full h-auto object-contain hover:opacity-80 transition-opacity duration-200"
          src={src}
          alt={alt}
          width={800}
          height={600}
          sizes={sizes}
          style={{ aspectRatio: size && `${size[0]} / ${size[1]}` }}
          onLoad={settle}
          onClick={onClick}
        />
      </div>
    </div>
  );
};

export default ProjectImage;
