import React, { useEffect, useRef } from "react";
import YouTube from "react-youtube";

const videoOpts = {
  height: "390",
  width: "100%",
};

export default function YouTubeVideo({
  videoId,
  seekTime,
}: {
  videoId: string;
  seekTime: number;
}) {
  const playerRef = useRef(null);

  useEffect(() => {
    // @ts-ignore
    if (playerRef?.current?.internalPlayer) {
      // @ts-ignore
      playerRef.current.internalPlayer.seekTo(seekTime);
    }
  }, [seekTime]);
  return videoId ? (
    <YouTube videoId={videoId} opts={videoOpts} ref={playerRef} />
  ) : (
    <div></div>
  );
}
