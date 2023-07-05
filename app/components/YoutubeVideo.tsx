import { memo, useEffect, useRef, useState } from "react";
import YouTube from "react-youtube";
import { usePlayerControl, useSeekTo } from "~/hooks/video";

export default function YouTubeVideo({
  videoId,
  seekTime,
  isBigScreen,
  playing,
  setPlaying,
  setDuration,
  setLoaded,
  setPlayingAll,
}: {
  videoId: string;
  seekTime: number;
  isBigScreen: boolean;
  playing: boolean;
  setPlaying: (playing: boolean) => void;
  setDuration: (duration: number) => void;
  setLoaded: (loaded: boolean) => void;
  setPlayingAll: (playingAll: boolean) => void;
}) {
  const playerRef = useRef(null);
  usePlayerControl({ setPlayingAll, playing, playerRef });
  useSeekTo(seekTime, playerRef);

  //  @ts-ignore
  console.log(playerRef.current);

  const videoOpts = isBigScreen
    ? {
        width: "100%",
        height: 300,
      }
    : {
        height: 300,
        width: "100%",
      };

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
