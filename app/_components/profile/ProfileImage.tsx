import { useEffect, useState } from "react";

import { motion, useAnimate } from "framer-motion";
import Image from "next/image";

const ProfileImage = () => {
  const [scope, animate] = useAnimate();
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    animate([
      [
        ".profile-image",
        { opacity: 1, scale: 1 },
        { duration: 1.2, delay: 0.5, ease: "easeOut", type: "spring", damping: 12 },
      ],
    ]).then(() => setIsDone(true));
  }, [animate]);

  return (
    <motion.div
      ref={scope}
      className="flex justify-center items-center"
      style={{ width: "100%", height: "240px", zIndex: 10 }}
      whileHover={isDone ? { y: -20 } : undefined}
      whileTap={isDone ? { scale: 0.95 } : undefined}
      transition={{ duration: 0.3, type: "spring", damping: 10, bounce: 0.2 }}
    >
      <motion.div
        className="profile-image"
        style={{
          opacity: 0,
          scale: 0.8,
          width: 180,
          height: 180,
          borderRadius: "50%",
          overflow: "hidden",
          border: "4px solid #ffffff",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.08)",
          backgroundColor: "#f3f4f6",
        }}
      >
        <Image
          src="/assets/profile.jpeg"
          alt="Profile"
          width={180}
          height={180}
          style={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
          }}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJiv/Z"
        />
      </motion.div>
    </motion.div>
  );
};

export default ProfileImage;
