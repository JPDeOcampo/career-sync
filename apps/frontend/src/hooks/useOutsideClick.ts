import { useEffect, useRef, RefObject } from "react";

export const useOutsideClick = (
  callback: () => void,
): RefObject<HTMLDivElement | null> => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let isDragging = false;

    const handlePointerDown = (event: PointerEvent) => {
      startX = event.clientX;
      startY = event.clientY;
      isDragging = false;
    };

    const handlePointerMove = (event: PointerEvent) => {
      const dx = Math.abs(event.clientX - startX);
      const dy = Math.abs(event.clientY - startY);

      // To check if finger moved, if it's a scroll/drag
      if (dx > 5 || dy > 5) {
        isDragging = true;
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      const el = ref.current;
      if (!el) return;

      // To ignore scroll/drag gestures completely
      if (isDragging) return;

      // To only handle real taps
      if (!el.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, [callback]);

  return ref;
};
