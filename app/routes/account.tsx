import { json, LoaderArgs, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Channel, getChannelByChannelId } from "~/models/channel.server";
import { getSearchesForUser, Search } from "~/models/search.server";
import { getVideoByVideoId, Video } from "~/models/video.server";
import { getUser } from "~/session.server";
import { formatDate } from "~/utils";

type EnrichedVideo = Video & { formattedDate: string };
type EnrichedChannel = Channel & { formattedDate: string };

type EnrichedSearch = Search & {
  video?: EnrichedVideo;
  channel?: EnrichedChannel;
};

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUser(request);
  if (!user) return redirect("/login");

  const searches = (await getSearchesForUser(user.id)) || [];
  const enrichedSearches = await Promise.all(
    searches.map(async (s) => {
      const formattedDate = formatDate(s.createdAt);
      if (s.searchType === "channel") {
        const channel = await getChannelByChannelId(s.resourceId);
        return { ...s, channel: { ...channel, formattedDate } };
      } else {
        const video = await getVideoByVideoId(s.resourceId);
        return { ...s, video: { ...video, formattedDate } };
      }
    })
  );
  return json({ searches: enrichedSearches });
};

export default function AccountPage() {
  const { searches } = useLoaderData<typeof loader>();
  return (
    <div className="mx-6 mt-6 flex h-[calc(100vh-80px)] flex-col">
      <div className="mb-6 text-xl font-bold">Recent searches</div>
      <div className="flex flex-row flex-wrap justify-evenly gap-4">
        <Searches searches={searches as EnrichedSearch[]} />
      </div>
    </div>
  );
}

function Searches({ searches }: { searches: EnrichedSearch[] }) {
  return (
    <>
      {searches.map((search) => {
        if (search.searchType === "channel") {
          return (
            <ChannelSearch
              key={`search-${search.id}`}
              search={search as EnrichedSearch & { channel: EnrichedChannel }}
            />
          );
        } else {
          return (
            <VideoSearch
              key={`search-${search.id}`}
              search={search as EnrichedSearch & { video: EnrichedVideo }}
            />
          );
        }
      })}
    </>
  );
}

function VideoSearch({
  search,
}: {
  search: EnrichedSearch & { video: EnrichedVideo };
}) {
  const { video } = search;
  return (
    <Link to={`/video?id=${search.video.videoId}&text=${search.searchText}`}>
      <div className="h-full max-w-sm rounded shadow-lg">
        <img
          className="w-full"
          src={video.thumbnailUrl}
          alt={`${video.title} thumbnail`}
        />
        <div className="px-6 py-4">
          <div className="mb-2 text-xl font-bold">{video.title}</div>
          <div className="mb-2 text-lg">{video.channelTitle}</div>
          <p className="text-base text-gray-700">{video.description}</p>
        </div>
        <div className="flex flex-row justify-between px-6 pb-2 pt-4">
          <div className="mb-2 mr-2 inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700">
            {search.searchText}
          </div>
          <div>{video.formattedDate}</div>
        </div>
      </div>
    </Link>
  );
}

function ChannelSearch({
  search,
}: {
  search: EnrichedSearch & { channel: EnrichedChannel };
}) {
  const { channel } = search;
  return (
    <Link
      to={`/channel?id=${search.channel.channelId}&text=${search.searchText}`}
    >
      <div className="h-full max-w-sm rounded shadow-lg">
        <img
          className="w-full"
          src={channel.thumbnailUrl}
          alt={`${channel.title} thumbnail`}
        />
        <div className="px-6 py-4">
          <div className="mb-2 text-xl font-bold">{channel.title}</div>
          <p className="text-base text-gray-700">{channel.description}</p>
        </div>
        <div className="flex flex-row justify-between px-6 pb-2 pt-4">
          <div className="mb-2 mr-2 inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700">
            {search.searchText}
          </div>
          <div>{channel.formattedDate}</div>
        </div>
      </div>
    </Link>
  );
}
