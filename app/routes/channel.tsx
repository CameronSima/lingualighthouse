import { json, LoaderArgs, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getVideosByChannelId } from "~/models/video.server";

import { searchChannelFromDb } from "~/search.server";
import { TextMatch } from "~/transcript.server";
import { formatDate } from "~/utils";
import { getChannelIdFromUrl, Video } from "~/youtube.server";

export const loader = async ({ request }: LoaderArgs) => {
  const params = new URL(request.url).searchParams;
  const channelUrl = params.get("channelUrl");
  const channelId = params.get("channelId");
  const searchText = params.get("text");

  if (channelUrl) {
    const channelId = await getChannelIdFromUrl(channelUrl);
    return redirect(`/channel?channelId=${channelId}&text=${searchText}`);
  }

  const videos = await getVideosByChannelId(channelId as string);
  const results = (await searchChannelFromDb(videos, searchText as string)).map(
    (r) => {
      return {
        video: {
          ...r.video,
          formattedDate: formatDate(r.video.publishedAt),
        },
        matches: r.matches,
      };
    }
  );

  // sort results by date
  const sortedResults = results.sort((a, b) => {
    return (
      new Date(b.video.publishedAt).getTime() -
      new Date(a.video.publishedAt).getTime()
    );
  });

  const channelName = videos[0]?.channelTitle || "";
  return json({ channelId, channelName, searchText, results: sortedResults });
};

export default function ChannelResultsPage() {
  const { results, searchText, channelName } = useLoaderData<typeof loader>();

  return (
    <>
      {results.length > 0 && (
        <div className="ml-6 mt-6 text-2xl font-bold">
          {results[0].video?.channelTitle}
        </div>
      )}
      <ResultsText
        numResults={results.length}
        searchText={searchText as string}
        channelName={channelName as string}
      />
      <div className="flex h-screen flex-row flex-wrap justify-evenly gap-4">
        {results.map(({ video, matches }, index) => (
          <Card
            key={`video-card-${video.id}-${index}`}
            video={video}
            matches={matches}
            searchText={searchText as string}
          />
        ))}
      </div>
    </>
  );
}

function Card({
  video,
  matches,
  searchText,
}: {
  video: Video & { formattedDate: string };
  matches: TextMatch[];
  searchText: string;
}) {
  const shortDescription = video.description.slice(0, 100);
  const description =
    shortDescription.length < video.description.length
      ? `${shortDescription}...`
      : shortDescription;

  return (
    <Link to={`/video?id=${video.id}&text=${searchText}`}>
      <div className="h-full max-w-sm rounded shadow-lg">
        <img
          className="w-full"
          src={video.thumbnailUrl}
          alt="Sunset in the mountains"
        />
        <div className="px-6 py-4">
          <div className="mb-2 text-xl font-bold">{video.title}</div>
          <p className="text-base text-gray-700">{description}</p>
        </div>
        <div className="flex flex-row justify-between px-6 pb-2 pt-4">
          <div className="mb-2 mr-2 inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700">
            {`${matches.length} matches`}
          </div>
          <div>{video.formattedDate}</div>
        </div>
      </div>
    </Link>
  );
}

function ResultsText({
  numResults,
  searchText,
}: {
  numResults: number;
  searchText: string;
  channelName: string;
}) {
  if (numResults > 0) {
    return (
      <h2 className="m-6 text-2xl underline">
        {numResults} results found for
        <span className="font-bold italic"> "{searchText}" </span>
      </h2>
    );
  }
  return (
    <h2 className="m-6 text-2xl underline">
      No results found for
      <span className="font-bold italic"> "{searchText}" </span>
    </h2>
  );
}
