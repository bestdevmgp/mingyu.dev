"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "react-feather";
import { RemoveScroll } from "react-remove-scroll";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";

import useOnClickOutside from "@/utils/useOnClickOutside";

interface ModalProps extends React.PropsWithChildren {}

const Modal = ({ children }: ModalProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const close = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);
  const exit = useCallback(() => {
    router.back();
  }, [router]);

  const contentRef = useRef<HTMLDivElement | null>(null);
  useOnClickOutside(contentRef, close);

  useEffect(() => {
    if (isOpen === false) {
      setTimeout(exit, 200);
    }
  }, [isOpen, exit]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            id="modal-overlay"
            className="w-screen h-screen bg-black/30 fixed top-0 left-0 z-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          />

          <div
            id="modal-container"
            className="
              w-screen h-screen fixed top-0 left-0 z-modal-content
              flex justify-center items-start"
          >
            <RemoveScroll>
              <motion.div
                id="modal-transition"
                initial={{ opacity: 0, translateY: 20, scale: 0.95 }}
                animate={{ opacity: 1, translateY: 0, scale: 1 }}
                exit={{ opacity: 0, translateY: 20, scale: 0.9 }}
                transition={{ duration: 0.1, damping: 0, ease: "easeOut" }}
              >
                <div
                  id="modal-content"
                  ref={contentRef}
                  className="
                    w-96 md:w-[688px] max-h-[calc(100vh_-_6rem)] my-12 p-6 md:p-8
                    bg-background border border-foreground/15 rounded-md md:rounded-lg
                    relative overflow-y-scroll
                    "
                >
                  {children}
                  <X
                    className="absolute top-5 right-5 md:top-7 md:right-7
                    w-6 h-6 md:w-8 md:h-8
                    text-foreground opacity-45 hover:opacity-60 active:opacity-75
                  "
                    strokeWidth={1.5}
                    onClick={close}
                  />
                </div>
              </motion.div>
            </RemoveScroll>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.getElementById("modal-root")!,
  );
};
export default Modal;
