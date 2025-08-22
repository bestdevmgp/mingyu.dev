"use client";

import { motion } from "framer-motion";

interface SlideUpInViewProps extends React.PropsWithChildren {
  once?: boolean;
}

const SlideUpInView = ({ children, once = true, ...props }: SlideUpInViewProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, translateY: 100 }}
      whileInView={{ opacity: 1, translateY: 0 }}
      viewport={{ once }}
      transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default SlideUpInView;
