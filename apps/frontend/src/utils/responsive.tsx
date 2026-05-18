import useSafeMediaQuery from "@/hooks/useMediaQuery";

// Width Hook
export const useSmBelow = () => useSafeMediaQuery({ maxWidth: 576 });
export const useMdBelow = () => useSafeMediaQuery({ maxWidth: 768 });
export const useLgBelow = () => useSafeMediaQuery({ maxWidth: 992 });
export const useXlBelow = () => useSafeMediaQuery({ maxWidth: 1200 });
export const use2XlBelow = () => useSafeMediaQuery({ maxWidth: 1400 });

// Height Hook
export const useSmShort = () => useSafeMediaQuery({ maxHeight: 700 });
