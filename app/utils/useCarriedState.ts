import { useEffect, useState } from "react";

import { isLocaleSwitching } from "@/utils/localeSwitch";

const store = new Map<string, unknown>();

export default function useCarriedState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() =>
    isLocaleSwitching() && store.has(key) ? (store.get(key) as T) : initial,
  );

  useEffect(() => {
    store.set(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
