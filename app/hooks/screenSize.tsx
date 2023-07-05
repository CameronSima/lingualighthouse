import { useEffect, useState } from "react";
import { BreakPoints } from "~/constants";

const useResizeListener = () => {
  const [isBigScreen, setIsBigScreen] = useState(false);

  useEffect(() => {
    const setBigScreen = () =>
      setIsBigScreen(window.innerWidth > BreakPoints.md);
    setBigScreen();
    window.addEventListener("resize", setBigScreen);
    return () => {
      window.removeEventListener("resize", setBigScreen);
    };
  }, []);

  return isBigScreen;
};

export default useResizeListener;
