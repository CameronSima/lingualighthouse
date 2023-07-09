import skipIcon from "../../public/skip-icon.svg";
import { memo, useContext, useState } from "react";
import { VideoContext, VideoDispatchContext } from "~/context/videoContext";
import usePlaying from "~/hooks/playingAll";
import useResizeListener from "~/hooks/screenSize";
import { VideoActions } from "~/reducers/video.reducer";

import { Video } from "~/youtube.server";
import ProgressBar from "./ProgressBar";
import { YouTubeVideoMemo } from "./YoutubeVideo";

export default function VideoContainer({
  video,
  searchText,
}: {
  video: Video;
  searchText: string;
}) {
  const { videoLoaded, matches } = useContext(VideoContext);
  const [progressTime, setProgressTime] = useState(0);

  usePlaying();
  const isBigScreen = useResizeListener();

  return (
    <div className="grid grid-cols-1 gap-6 gap-y-10 md:grid-cols-2">
      {isBigScreen !== undefined && (
        <div className="order-1">
          <YouTubeVideoMemo
            videoId={video?.id as string}
            isBigScreen={isBigScreen}
            setProgressTime={setProgressTime}
          />
        </div>
      )}
      {videoLoaded && (
        <div className="order-2 col-span-1 md:order-3 md:col-span-2">
          <ProgressBar progressTime={progressTime} />
        </div>
      )}
      <div className="order-3 ml-6 md:order-2 md:ml-0">
        <AsideMemo
          video={video}
          numResults={matches.length}
          searchText={searchText}
        />
      </div>
    </div>
  );
}

function Aside({
  video,
  numResults,
  searchText,
}: {
  video: Video;
  numResults: number;
  searchText: string | undefined;
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
      <Controls />
    </div>
  );
}

const AsideMemo = memo(Aside);

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

function Controls({}: {}) {
  const { isPlayingAllMatches } = useContext(VideoContext);
  const dispatch = useContext(VideoDispatchContext);

  return (
    <div className="flex flex-row items-center gap-6">
      <label className="relative mt-3 inline-flex cursor-pointer items-center md:mt-0">
        <input
          type="checkbox"
          checked={isPlayingAllMatches}
          onChange={(e) =>
            dispatch({
              type: e.target.checked
                ? VideoActions.PLAY_ALL
                : VideoActions.PLAY_ALL_STOP,
            })
          }
          className="peer sr-only"
        />
        <div className="flex flex-row items-center gap-3">
          <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
          <div className="text-sm font-medium text-gray-900">
            {isPlayingAllMatches ? "Stop playing all" : "Play all"}
          </div>
        </div>
      </label>
      <div
        className="flex cursor-pointer flex-row items-center gap-3"
        onClick={() => dispatch({ type: VideoActions.PLAY_NEXT })}
      >
        <img className="w-10" src={skipIcon} />
        <span className="text-sm font-medium text-gray-900">Play next</span>
      </div>
    </div>
  );
}
