import { useEffect, useRef, RefObject } from "react";

type InfiniteScrollCallback = () => void;

const useInfiniteScroll = (
  callback: InfiniteScrollCallback,
): RefObject<HTMLDivElement | null> => {
  const ref = useRef<HTMLDivElement | null>(null);
  const lastScrollTop = useRef(0);
  const isFetching = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onScroll = (): void => {
      const { scrollTop, clientHeight, scrollHeight } = el;

      const isScrollingDown = scrollTop > lastScrollTop.current;
      lastScrollTop.current = scrollTop;

      const nearBottom = scrollTop + clientHeight >= scrollHeight - 150;

      // to prevent multiple triggers while already at bottom/loading
      if (!isScrollingDown || isFetching.current) return;

      if (nearBottom) {
        isFetching.current = true;

        callback();

        setTimeout(() => {
          isFetching.current = false;
        }, 500);
      }
    };

    el.addEventListener("scroll", onScroll);

    return () => {
      el.removeEventListener("scroll", onScroll);
    };
  }, [callback]);

  return ref;
};

export default useInfiniteScroll;
