import { useEffect, useState } from "react";
import { TextMatch } from "~/transcript.server";
import { Video } from "~/youtube.server";
import ProgressBar from "./ProgressBar";
import YouTubeVideo from "./YoutubeVideo";

// tailwind's breakpoints
const breakPoints = {
  md: 768,
  lg: 1024,
};

export default function VideoContainer({
  video,
  selected,
  matches,
  setSelected,
}: {
  video: Video;
  selected: TextMatch;
  matches: TextMatch[];
  setSelected: (match: TextMatch) => void;
}) {
  const [duration, setDuration] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [seekTime, setSeekTime] = useState<number>(selected.startSeconds);
  const [isBigScreen, setIsBigScreen] = useState<boolean | undefined>(
    undefined
  );
  const [playingAll, setPlayingAll] = useState(false);

  console.log(selected);

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

        return () => clearTimeout(timeout);
      }, (timeToNext + 1) * 1000);
    }
  }, [playingAll, selected, matches, videoLoaded]);

  useEffect(() => {
    const setBigScreen = () =>
      setIsBigScreen(window.innerWidth > breakPoints.md);
    setBigScreen();
    window.addEventListener("resize", setBigScreen);
    return () => {
      window.removeEventListener("resize", setBigScreen);
    };
  }, []);
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {isBigScreen !== undefined && (
        <div className="order-1">
          <YouTubeVideo
            videoId={video?.id as string}
            seekTime={seekTime}
            isBigScreen={isBigScreen}
            playing={playing}
            setPlaying={setPlaying}
            setDuration={setDuration}
            setLoaded={setVideoLoaded}
          />
        </div>
      )}
      {videoLoaded && (
        <div className="order-2 col-span-1 md:order-3 md:col-span-2">
          <ProgressBar
            selected={selected}
            video={video}
            matches={matches}
            duration={duration}
          />
        </div>
      )}
      <div className="order-3 ml-6 md:order-2 md:ml-0">
        <Aside
          video={video}
          numResults={matches.length}
          searchText={selected.exactText}
          playingAll={playingAll}
          setPlayingAll={setPlayingAll}
        />
      </div>
    </div>
  );
}

function Aside({
  video,
  numResults,
  searchText,
  playingAll,
  setPlayingAll,
}: {
  video: Video;
  numResults: number;
  searchText: string;
  playingAll: boolean;
  setPlayingAll: (playing: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-2 md:px-3">
      <div className="text-lg font-bold">{video.title || "No video found"}</div>

      <div className="text-lg font-bold">{video.channelTitle}</div>

      <ResultsText numResults={numResults} searchText={searchText as string} />
      <Controls playingAll={playingAll} setPlayingAll={setPlayingAll} />
    </div>
  );
}

function ResultsText({
  numResults,
  searchText,
}: {
  numResults: number;
  searchText: string;
}) {
  if (numResults > 0) {
    return (
      <h2 className="text-md">
        {numResults} results found for
        <span className="font-bold italic"> "{searchText}" </span>
      </h2>
    );
  }
  return (
    <h2 className="text-md">
      No results found for
      <span className="font-bold italic"> "{searchText}" </span>
    </h2>
  );
}

function Controls({
  playingAll,
  setPlayingAll,
}: {
  playingAll: boolean;
  setPlayingAll: (playing: boolean) => void;
}) {
  console.log({ playingAll });

  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        checked={playingAll}
        onChange={(e) => setPlayingAll(e.target.checked)}
        className="peer sr-only"
      />
      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
      <span className="ml-3 text-sm font-medium text-gray-900">
        {playingAll ? "Stop playing all" : "Play all"}
      </span>
    </label>
  );
}
