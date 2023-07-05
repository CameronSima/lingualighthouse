import { useEffect } from "react";

export function usePlayerControl({
  setPlayingAll,
  playing,
  playerRef,
}: {
  setPlayingAll: (playing: boolean) => void;
  playing: boolean;
  playerRef: any;
}) {
  useEffect(() => {
    // @ts-ignore
    if (playerRef?.current?.internalPlayer) {
      // @ts-ignore
      if (playing) {
        // @ts-ignore
        playerRef.current.internalPlayer.playVideo();
      } else {
        // @ts-ignore
        playerRef.current.internalPlayer.pauseVideo();
        setPlayingAll(false);
      }
    }
  }, [playing, playerRef?.current?.internalPlayer, setPlayingAll]);
}

export function useSeekTo(seekTime: number, playerRef: any) {
  useEffect(() => {
    // @ts-ignore
    if (playerRef?.current?.internalPlayer) {
      // @ts-ignore
      playerRef.current.internalPlayer.seekTo(seekTime);
    }
  }, [seekTime, playerRef?.current?.internalPlayer]);
}
