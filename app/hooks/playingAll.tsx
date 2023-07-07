import { useContext, useEffect, useState } from "react";
import { VideoContext, VideoDispatchContext } from "~/context/videoContext";
import { VideoActions } from "~/reducers.ts/video.reducer";
import { TextMatch } from "~/transcript.server";

export default function usePlaying({
  selected,
  matches,

  setSelected,
}: {
  selected: TextMatch;
  matches: TextMatch[];

  setSelected: (match: TextMatch) => void;
}) {
  const videoState = useContext(VideoContext);
  const dispatch = useContext(VideoDispatchContext);
  const { videoLoaded, isPlayingAllMatches, isPlaying } = videoState;
  useEffect(() => {
    if (isPlayingAllMatches && videoLoaded) {
      dispatch({
        type: VideoActions.SET_SEEK_TIME,
        payload: selected.startSeconds,
      });
      if (!isPlaying) {
        dispatch({ type: VideoActions.PLAY });
      }

      const timeToNext = selected.endSeconds - selected.startSeconds;
      const timeout = setTimeout(() => {
        // find the next match
        const currentMatchIndex = matches.findIndex(
          (match) => match.id === selected.id
        );
        const nextMatch = matches[currentMatchIndex + 1];

        if (nextMatch) {
          setSelected(nextMatch);
        } else {
          dispatch({ type: VideoActions.PLAY_ALL_STOP });
          dispatch({ type: VideoActions.PAUSE });
        }
      }, (timeToNext + 1) * 1000);

      return () => clearTimeout(timeout);
    }
  }, [isPlayingAllMatches, selected, matches, videoLoaded]);
}
