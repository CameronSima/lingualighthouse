import { useContext } from "react";
import { memo, useEffect, useRef, useState } from "react";
import YouTube, { YouTubeEvent } from "react-youtube";
import { VideoContext, VideoDispatchContext } from "~/context/videoContext";
import useEmitVideoProgress from "~/hooks/emitVideoProgress";
import { usePlayerControl, useSeekTo } from "~/hooks/video";
import { VideoActions } from "~/reducers.ts/video.reducer";

export default function YouTubeVideo({
  videoId,
  isBigScreen,
  setProgressTime,
}: {
  videoId: string;
  isBigScreen: boolean;
  setProgressTime: (t: number) => void;
}) {
  const playerRef = useRef(null);
  const { isPlaying, seekTime } = useContext(VideoContext);
  const dispatch = useContext(VideoDispatchContext);

  usePlayerControl(isPlaying, playerRef);
  useSeekTo(seekTime, playerRef);
  useEmitVideoProgress(setProgressTime, playerRef);

  console.log("RENDERING VIDEO");

  const videoOpts = isBigScreen
    ? {
        width: "100%",
        height: 300,
      }
    : {
        height: 300,
        width: "100%",
      };

  const onLoad = (e: YouTubeEvent<any>) => {
    dispatch({ type: VideoActions.SET_VIDEO_LOADED });
    dispatch({
      type: VideoActions.SET_DURATION,
      payload: e.target.getDuration(),
    });
  };

  return videoId ? (
    <YouTube
      videoId={videoId}
      opts={videoOpts}
      ref={playerRef}
      onPlay={() => dispatch({ type: VideoActions.PLAY })}
      onPause={() => dispatch({ type: VideoActions.PAUSE })}
      onReady={onLoad}
    />
  ) : (
    <div></div>
  );
}

export const YouTubeVideoMemo = memo(YouTubeVideo);
