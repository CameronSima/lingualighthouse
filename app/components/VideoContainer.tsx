import { useReducer, useState } from "react";
import { VideoContext } from "~/context/videoContext";
import usePlaying from "~/hooks/playingAll";
import useResizeListener from "~/hooks/screenSize";
import { TextMatch } from "~/transcript.server";
import { Video } from "~/youtube.server";
import ProgressBar from "./ProgressBar";
import YouTubeVideo from "./YoutubeVideo";

export default function VideoContainer({
  video,
  selected,
  matches,
  seekTime,
  setSeekTime,
  setSelected,
}: {
  video: Video;
  selected: TextMatch;
  matches: TextMatch[];
  seekTime: number;
  setSeekTime: (time: number) => void;
  setSelected: (match: TextMatch) => void;
}) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  //   const [playerState, setPlayerState] = useState({
  //     playing: false,
  //     playingAll: false,
  //     progress: 0,
  //     seekTime: 0,

  //   });

  const { playing, setPlaying, playingAll, setPlayingAll } = usePlaying({
    videoLoaded,
    selected,
    matches,
    setSeekTime,
    setSelected,
  });
  const [duration, setDuration] = useState(0);
  const isBigScreen = useResizeListener();

  return (
    // <VideoContext.Provider value={playerState}>
    <div className="grid grid-cols-1 gap-6 gap-y-10 md:grid-cols-2">
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
            setPlayingAll={setPlayingAll}
          />
        </div>
      )}
      {videoLoaded && (
        <div className="order-2 col-span-1 md:order-3 md:col-span-2">
          <ProgressBar
            selected={selected}
            matches={matches}
            duration={duration}
            setSelected={setSelected}
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
    // </VideoContext.Provider>
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
    <div className="flex h-full flex-col justify-between md:px-3">
      <div className="flex flex-col gap-2">
        <div className="text-lg font-bold">
          {video.title || "No video found"}
        </div>

        <div className="text-lg font-bold">{video.channelTitle}</div>
        <ResultsText
          numResults={numResults}
          searchText={searchText as string}
        />
      </div>
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
    <label className="relative mt-3 inline-flex cursor-pointer items-center md:mt-0">
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
