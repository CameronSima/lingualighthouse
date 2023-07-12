import { json, LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { memo, useContext, useEffect, useRef } from "react";
import VideoContainer from "~/components/VideoContainer";
import {
  VideoContext,
  VideoDispatchContext,
  VideoProvider,
} from "~/context/videoContext";
import useOnScreen from "~/hooks/isInView";
import { VideoActions } from "~/reducers/video.reducer";
import { searchVideo } from "~/search.server";
import { TextMatch } from "~/transcript.server";
import { cleanVideoId } from "~/utils";

export const loader = async ({ request }: LoaderArgs) => {
  const params = new URL(request.url).searchParams;
  let videoId = params.get("id");
  const searchText = params.get("text");

  if (!videoId || !searchText) {
    return json({ video: null, searchText, matches: [], numResults: 0 });
  }
  videoId = cleanVideoId(videoId);

  const { matches, video } = await searchVideo(
    videoId as string,
    searchText as string
  );
  return json(
    { video, searchText, matches, numResults: matches.length },
    {
      headers: {
        "X-Results-Found": (matches.length > 0).toString(),
      },
    }
  );
};

export default function VideoResultsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <VideoProvider matches={data.matches}>
      <div className="flex h-[calc(100vh-80px)] flex-col gap-4">
        {data.video && (
          <VideoContainer video={data.video} searchText={data.searchText} />
        )}
        <div className="overflow-y-scroll">
          <Matches />
        </div>
      </div>
    </VideoProvider>
  );
}

function Matches() {
  const { matches, selected } = useContext(VideoContext);
  const dispatch = useContext(VideoDispatchContext);
  const setSelected = (m: TextMatch) =>
    dispatch({ type: VideoActions.SET_SELECTED, payload: m });
  return (
    <div className="flex flex-col gap-4">
      {matches.map((match) => (
        <MatchMemo
          key={match.id}
          match={match}
          selected={selected}
          setSelected={setSelected}
        />
      ))}
    </div>
  );
}

function Match({
  match,
  selected,
  setSelected,
}: {
  match: TextMatch;
  selected: TextMatch | undefined;
  setSelected: (match: TextMatch) => void;
}) {
  const scrollToRef = useRef(null);
  const isVisible = useOnScreen(scrollToRef);
  const selectedClass =
    selected?.id === match.id
      ? "bg-gray-400 hover:bg-gray-400"
      : "bg-white hover:bg-gray-200";

  const clickHander = () => {
    setSelected(match);
  };

  useEffect(() => {
    if (!isVisible && selected?.id === match.id) {
      // @ts-ignore
      scrollToRef?.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [selected]);
  return (
    <div
      className={`w-full cursor-pointer overflow-hidden shadow-lg ${selectedClass}`}
      onClick={clickHander}
      ref={scrollToRef}
    >
      <div className="px-6 py-4">
        <p className="text-base italic text-gray-800">
          {' "...'}
          {match.precedingText}
          <span className="font-bold">{" " + match.exactText + " "}</span>
          {match.followingText}
          {'..."'}
        </p>
        <p className="text-gray-500">{match.startSecondsFormatted}</p>
      </div>
    </div>
  );
}

const MatchMemo = memo(Match);
