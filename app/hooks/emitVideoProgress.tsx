import { useEffect } from "react";

export default function useEmitVideoProgress(
  setProgressTime: (t: number) => void,
  playerRef: any
) {
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current?.internalPlayer) {
        playerRef.current.internalPlayer.getCurrentTime().then((t: number) => {
          setProgressTime(t);
        });
      }
    }, 300);
    return () => clearInterval(interval);
  }, [setProgressTime, playerRef?.current?.internalPlayer]);
}
