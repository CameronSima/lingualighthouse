import { useContext, useEffect } from "react";
import { VideoContext, VideoDispatchContext } from "~/context/videoContext";
import { VideoActions } from "~/reducers/video.reducer";

export default function usePlaying() {
  const videoState = useContext(VideoContext);
  const dispatch = useContext(VideoDispatchContext);
  const { videoLoaded, isPlayingAllMatches, isPlaying, selected, matches } =
    videoState;
  useEffect(() => {
    if (selected && isPlayingAllMatches && videoLoaded) {
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
          dispatch({ type: VideoActions.SET_SELECTED, payload: nextMatch });
        } else {
          dispatch({ type: VideoActions.PLAY_ALL_STOP });
          dispatch({ type: VideoActions.PAUSE });
        }
      }, (timeToNext + 1) * 1000);

      return () => clearTimeout(timeout);
    }
  }, [isPlayingAllMatches, selected, matches, videoLoaded]);
}
