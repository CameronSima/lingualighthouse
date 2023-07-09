import { RefObject, useState, useEffect } from "react";

export default function useOnScreen(ref: RefObject<HTMLElement>) {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) =>
      setIntersecting(entry.isIntersecting)
    );

    observer.observe(ref.current as HTMLElement);
    return () => observer.disconnect();
  }, []);

  return isIntersecting;
}
