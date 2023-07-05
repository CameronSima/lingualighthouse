import { useEffect, useState } from "react";
import { TextMatch } from "~/transcript.server";

export default function usePlaying({
  videoLoaded,
  selected,
  matches,
  setSeekTime,
  setSelected,
}: {
  videoLoaded: boolean;
  selected: TextMatch;
  matches: TextMatch[];
  setSeekTime: (time: number) => void;
  setSelected: (match: TextMatch) => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [playingAll, setPlayingAll] = useState(false);
  useEffect(() => {
    if (playingAll && videoLoaded) {
      setSeekTime(selected.startSeconds);
      if (!playing) {
        setPlaying(true);
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
          setPlayingAll(false);
          setPlaying(false);
        }
      }, (timeToNext + 1) * 1000);

      return () => clearTimeout(timeout);
    }
  }, [playingAll, selected, matches, videoLoaded]);

  // Return any additional values you need from the hook
  return { playing, setPlaying, playingAll, setPlayingAll };
}
