import { useContext, useEffect } from "react";
import { VideoContext, VideoDispatchContext } from "~/context/videoContext";
import { VideoActions } from "~/reducers.ts/video.reducer";

export function usePlayerControl(isPlaying: boolean, playerRef: any) {
  const dispatch = useContext(VideoDispatchContext);

  useEffect(() => {
    // @ts-ignore
    if (playerRef?.current?.internalPlayer) {
      // @ts-ignore
      if (isPlaying) {
        // @ts-ignore
        playerRef.current.internalPlayer.playVideo();
      } else {
        // @ts-ignore
        playerRef.current.internalPlayer.pauseVideo();
        dispatch({ type: VideoActions.PLAY_ALL_STOP });
      }
    }
  }, [isPlaying, playerRef?.current?.internalPlayer]);
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
