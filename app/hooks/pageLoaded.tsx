import { useState, useEffect } from "react";

export default function useIsPageLoaded() {
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  useEffect(() => {
    setIsPageLoaded(true);
  }, []);
  return isPageLoaded;
}
