import {
  useFetcher,
  useLoaderData,
  useNavigate,
  useTransition,
} from "@remix-run/react";
import { LoaderArgs } from "@remix-run/server-runtime";
import { useEffect, useState } from "react";
import TextTransition from "react-text-transition";
import { json } from "react-router";
import Spinner from "~/components/Spinner";
import useIsPageLoaded from "~/hooks/pageLoaded";

export const loader = async ({ params, request }: LoaderArgs) => {
  const { channelId, searchText } = params;
  return json({ channelId, searchText });
};

export default function JobStatusPage() {
  const navigate = useNavigate();
  const transition = useTransition();
  const fetcher = useFetcher<typeof loader>();
  const { channelId, searchText } = useLoaderData<typeof loader>();
  const pageLoaded = useIsPageLoaded();
  const [stats, setStats] = useState({
    numVideosProcessed: 0,
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
      numVideosProcessed: fetcher.data?.job?.numVideosProcessed || 0,
    };

    const incrementInterval = setInterval(() => {
      setStats((prevStats) => ({
        numVideosProcessed:
          prevStats.numVideosProcessed < currentStats.numVideosProcessed
            ? prevStats.numVideosProcessed + 1
            : currentStats.numVideosProcessed,
      }));
    }, 10);

    return () => clearInterval(incrementInterval);
  }, [fetcher.data?.job?.numVideosProcessed]);

  return (
    <div className="mx-6 flex h-[calc(100vh-80px)] flex-col items-center justify-center md:mx-0">
      <div className="mb-6 flex flex-row items-center justify-center gap-8">
        <div className="text-3xl font-bold">Loading</div>
        <Spinner />
      </div>

      <div className="flex flex-row gap-4">
        <div className="justif-start flex flex-col">
          <div className="text-2xl font-bold">
            {pageLoaded && (
              <TextTransition>
                {transition.state !== "idle"
                  ? "Preparing results!"
                  : fetcher.data?.job?.status || "pending"}
              </TextTransition>
            )}
          </div>
          <div className="text-2xl font-bold">
            {pageLoaded && (
              <Odometer value={formatNumber(stats.numVideosProcessed || 0)} />
            )}
          </div>
        </div>
        <div className="justif-start flex flex-col">
          <div className="text-2xl">status</div>
          <div className="text-2xl">videos processed</div>
        </div>
      </div>
    </div>
  );
}

function Odometer({ value }: { value: string }) {
  return (
    <>
      {value.split("").map((char, i) => {
        return (
          <TextTransition inline key={`o-${char}-${i}`}>
            {char}
          </TextTransition>
        );
      })}
    </>
  );
}

function formatNumber(num: number) {
  return num.toLocaleString();
}
