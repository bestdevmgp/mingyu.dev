import { useEffect, useRef, useState } from "react";

import useFocusScope from "@/utils/useFocusScope";
import useOnClickOutside from "@/utils/useOnClickOutside";
import useOnEscape from "@/utils/useOnEscape";

const useDropdown = (initialFocus: string) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, isOpen, () => setIsOpen(false));
  useOnEscape(isOpen, () => setIsOpen(false));
  useFocusScope(ref, isOpen, initialFocus);

  useEffect(() => {
    if (!isOpen) return;
    const closeIfHidden = () => {
      if (!ref.current?.getClientRects().length) setIsOpen(false);
    };
    window.addEventListener("resize", closeIfHidden);
    return () => window.removeEventListener("resize", closeIfHidden);
  }, [isOpen]);

  return { isOpen, setIsOpen, ref };
};

export default useDropdown;
