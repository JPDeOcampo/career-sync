/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";

interface MediaQuerySettings {
  query?: string;
  minWidth?: number | string;
  maxWidth?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;
  orientation?: 'portrait' | 'landscape';
}

const useSafeMediaQuery = (settings: MediaQuerySettings) => {
  const [isMounted, setIsMounted] = useState(false);
  const isMatch = useMediaQuery(settings);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Return the match only after mounting to ensure hydration safety
  return isMounted ? isMatch : false;
};

export default useSafeMediaQuery;