import { json, LoaderArgs, defer } from "@remix-run/node";
import { Await, Link, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

import { searchChannel } from "~/search.server";
import { TextMatch } from "~/transcript.server";
import { Video } from "~/youtube.server";

export const loader = ({ request }: LoaderArgs) => {
  const params = new URL(request.url).searchParams;
  const channelName = params.get("channel");
  const searchText = params.get("text");

  console.log({ channelName, searchText });

  const results = searchChannel(channelName as string, searchText as string);
  //return json({ channelName, results, searchText });
  return defer({ channelName, results, searchText });
};

export default function ChannelResultsPage() {
  const data = useLoaderData<typeof loader>();

  console.log({ data });

  return (
    <Suspense fallback={<Loading />}>
      <Await resolve={data.results}>
        {(results) => {
          return (
            <>
              {results.length > 0 && (
                <div className="ml-6 mt-6 text-2xl font-bold">
                  {results[0].video?.channelTitle}
                </div>
              )}
              <ResultsText
                numResults={results.length}
                searchText={data.searchText as string}
                channelName={data.channelName as string}
              />
              <div className="flex h-screen flex-row flex-wrap justify-evenly gap-4">
                {results.map(({ video, matches }, index) => (
                  <Card
                    key={`video-card-${video.id}-${index}`}
                    video={video}
                    matches={matches}
                    searchText={data.searchText as string}
                  />
                ))}
              </div>
            </>
          );
        }}
      </Await>
    </Suspense>
  );
}

function Loading() {
  return (
    <div className="flex flex-col justify-around" style={{ height: "100%" }}>
      <h1 className="text-center text-4xl">Loading...</h1>
    </div>
  );
}

function Card({
  video,
  matches,
  searchText,
}: {
  video: Video;
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
      <div className="max-w-sm rounded shadow-lg">
        <img
          className="w-full"
          src={video.thumbnailUrl}
          alt="Sunset in the mountains"
        />
        <div className="px-6 py-4">
          <div className="mb-2 text-xl font-bold">{video.title}</div>
          <p className="text-base text-gray-700">{description}</p>
        </div>
        <div className="px-6 pb-2 pt-4">
          <span className="mb-2 mr-2 inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700">
            {`${matches.length} matches`}
          </span>
        </div>
      </div>
    </Link>
  );
}

function ResultsText({
  numResults,
  searchText,
  channelName,
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
