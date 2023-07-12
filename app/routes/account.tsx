import { json, LoaderArgs, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Channel, getChannelByChannelId } from "~/models/channel.server";
import { getSearchesForUser, Search } from "~/models/search.server";
import { getVideoByVideoId, Video } from "~/models/video.server";
import { getUser } from "~/session.server";
import { formatDate } from "~/utils";

type EnrichedSearch = Search & {
  video?: Video;
  channel?: Channel;
  formattedDate: string;
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

        return { ...s, channel, formattedDate };
      } else {
        const video = await getVideoByVideoId(s.resourceId);

        return { ...s, video, formattedDate };
      }
    })
  );
  console.log({ enrichedSearches });
  return json({ searches: enrichedSearches });
};

export default function AccountPage() {
  const { searches } = useLoaderData<typeof loader>();
  return (
    <div className="mx-6 mt-6 flex h-[calc(100vh-80px)] flex-col">
      <div className="mb-6 text-xl font-bold">Recent searches</div>
      <div className="flex flex-col justify-evenly gap-4">
        <Searches searches={searches as EnrichedSearch[]} />
      </div>
    </div>
  );
}

function Searches({ searches }: { searches: EnrichedSearch[] }) {
  return (
    <>
      {searches.map((search) => {
        const item = search.channel ? search.channel : search.video;
        const url = `/${search.channel ? "channel" : "video"}?id=${
          search.channel ? search.channel.channelId : search.video!.videoId
        }&text=${search.searchText}`;
        return (
          <SearchResultItem
            url={item!.url}
            thumbnailUrl={item!.thumbnailUrl}
            title={item!.title}
            channelTitle={search.video && search.video!.channelTitle}
            searchText={search.searchText}
            formattedDate={search.formattedDate}
            type={search.channel ? "Channel" : "Video"}
          />
        );
      })}
    </>
  );
}

function SearchResultItem({
  url,
  thumbnailUrl,
  title,
  channelTitle,
  searchText,
  formattedDate,
  type,
}: {
  url: string;
  thumbnailUrl: string;
  title: string;
  channelTitle?: string;
  searchText: string;
  formattedDate: string;
  type: string;
}) {
  return (
    <Link to={url}>
      <div className="flex h-36 w-full flex-row justify-between rounded shadow-lg">
        <div className="flex h-36 ">
          <img src={thumbnailUrl} alt={`${title} thumbnail`} />
          <div className="flex flex-col justify-start overflow-hidden pl-3">
            <div className="mb-2 text-sm font-bold md:text-xl">{type}</div>
            <div>
              <div className="mb-2 text-sm  md:text-xl">{title}</div>
              {channelTitle && (
                <div className="mb-2 text-sm md:text-lg">{channelTitle}</div>
              )}
            </div>
          </div>
        </div>
        <div className="m-2 flex flex-col justify-between">
          <div className="inline-block rounded-full bg-blue-200 px-3 py-1 text-center text-base font-semibold text-blue-700">
            "{searchText}"
          </div>
          <div className="text-xs font-bold md:text-base">{formattedDate}</div>
        </div>
      </div>
    </Link>
  );
}
