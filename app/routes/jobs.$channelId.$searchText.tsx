import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { LoaderArgs } from "@remix-run/server-runtime";
import { useEffect, useReducer, useState } from "react";

import { json } from "react-router";
import Spinner from "~/components/Spinner";

export const loader = async ({ params, request }: LoaderArgs) => {
  const { channelId, searchText } = params;
  return json({ channelId, searchText });
};

export default function JobStatusPage() {
  const navigate = useNavigate();
  const fetcher = useFetcher<typeof loader>();
  const { channelId, searchText } = useLoaderData<typeof loader>();
  const [stats, setStats] = useState({
    numVideosFound: 0,
    numVideosProcessed: 0,
    numVideosFailed: 0,
  });

  // effect for loading new data
  useEffect(() => {
    const interval = setInterval(() => {
      const jobStatus = fetcher.data?.job?.status;
      if (jobStatus === "completed") {
        clearInterval(interval);
        return navigate(`/channel/?channelId=${channelId}&text=${searchText}`);
      }
      fetcher.load(`/api/jobs/${channelId}/${searchText}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [fetcher.data?.job?.status]);

  // effect for incrementing the video stats by one from old value to new value
  useEffect(() => {
    const currentStats = {
      numVideosFound: fetcher.data?.job?.numVideosFound || 0,
      numVideosProcessed: fetcher.data?.job?.numVideosProcessed || 0,
      numVideosFailed: fetcher.data?.job?.numVideosFailed || 0,
    };

    const incrementInterval = setInterval(() => {
      setStats((prevStats) => ({
        numVideosFound:
          prevStats.numVideosFound < currentStats.numVideosFound
            ? prevStats.numVideosFound + 1
            : currentStats.numVideosFound,
        numVideosProcessed:
          prevStats.numVideosProcessed < currentStats.numVideosProcessed
            ? prevStats.numVideosProcessed + 1
            : currentStats.numVideosProcessed,
        numVideosFailed:
          prevStats.numVideosFailed < currentStats.numVideosFailed
            ? prevStats.numVideosFailed + 1
            : currentStats.numVideosFailed,
      }));
    }, 10);

    return () => clearInterval(incrementInterval);
  }, [
    fetcher.data?.job?.numVideosFound,
    fetcher.data?.job?.numVideosProcessed,
    fetcher.data?.job?.numVideosFailed,
  ]);

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="mb-6 flex flex-row items-center justify-center gap-8">
        <div className="text-3xl font-bold">Loading</div>
        <Spinner />
      </div>

      <div className="flex flex-row gap-4">
        <div className="justif-start flex flex-col">
          <div className="text-2xl font-bold">
            {fetcher.data?.job?.status || "pending"}
          </div>
          <div className="text-2xl font-bold">
            {formatNumber(stats.numVideosFound || 0)}
          </div>
          <div className="text-2xl font-bold">
            {formatNumber(stats.numVideosProcessed || 0)}
          </div>
          <div className="text-2xl font-bold">
            {formatNumber(stats.numVideosFailed || 0)}
          </div>
        </div>
        <div className="justif-start flex flex-col">
          <div className="text-2xl">status</div>
          <div className="text-2xl">videos found</div>
          <div className="text-2xl">videos processed</div>
          <div className="text-2xl">videos with transcripts disabled</div>
        </div>
      </div>
    </div>
  );
}

function formatNumber(num: number) {
  return num.toLocaleString();
}
