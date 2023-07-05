import { json, LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import VideoContainer from "~/components/VideoContainer";
import YouTubeVideo from "~/components/YoutubeVideo";
import useOnScreen from "~/hooks/isInView";
import { searchVideo } from "~/search.server";
import { TextMatch } from "~/transcript.server";

function cleanVideoId(videoId: string) {
  const ytUrls = [
    "https://www.youtube.com/watch?v=",
    "https://youtu.be/",
    "https://www.youtube.com/embed/",
  ];

  for (const url of ytUrls) {
    if (videoId.includes(url)) {
      return videoId.replace(url, "");
    }
  }
  return videoId;
}

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
  return json({ video, searchText, matches, numResults: matches.length });
};

export default function VideoResultsPage() {
  const data = useLoaderData<typeof loader>();

  const [selected, setSelected] = useState(data.matches[0]);
  return (
    <div className="flex h-[calc(100vh-80px)] flex-col gap-4">
      <>
        {data.video && (
          <VideoContainer
            video={data.video}
            selected={selected}
            matches={data.matches}
            setSelected={setSelected}
          />
        )}

        <div className="overflow-y-scroll">
          <Matches
            matches={data.matches}
            selected={selected}
            setSelected={setSelected}
          />
        </div>
      </>
    </div>
  );
}

function Matches({
  matches,
  selected,
  setSelected,
}: {
  matches: TextMatch[];
  selected: TextMatch;
  setSelected: (match: TextMatch) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {matches.map((match) => (
        <Match
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
  selected: TextMatch;
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
