import { useEffect, useRef, RefObject } from "react";

export const useOutsideClick = (
  callback: () => void,
): RefObject<HTMLDivElement | null> => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const el = ref.current;
      if (!el) return;

      if (el.contains(event.target as Node)) return;

      callback();
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [callback]);

  return ref;
};
