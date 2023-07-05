import { memo, useEffect, useRef, useState } from "react";
import YouTube from "react-youtube";

export default function YouTubeVideo({
  videoId,
  seekTime,
  isBigScreen,
  playing,
  setPlaying,
  setDuration,
  setLoaded,
}: {
  videoId: string;
  seekTime: number;
  isBigScreen: boolean;
  playing: boolean;
  setPlaying: (playing: boolean) => void;
  setDuration: (duration: number) => void;
  setLoaded: (loaded: boolean) => void;
}) {
  const playerRef = useRef(null);

  console.log(isBigScreen);

  const videoOpts = isBigScreen
    ? {
        width: "100%",
        height: 300,
      }
    : {
        height: 300,
        width: "100%",
      };

  useEffect(() => {
    // @ts-ignore
    if (playerRef?.current?.internalPlayer) {
      // @ts-ignore
      playerRef.current.internalPlayer.seekTo(seekTime);
    }
  }, [seekTime]);

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
      }
    }
  }, [playing]);
  return videoId ? (
    <YouTube
      videoId={videoId}
      opts={videoOpts}
      ref={playerRef}
      onPlay={() => setPlaying(true)}
      onPause={() => setPlaying(false)}
      onReady={(e) => {
        setDuration(e.target.getDuration());
        setLoaded(true);
      }}
    />
  ) : (
    <div></div>
  );
}
