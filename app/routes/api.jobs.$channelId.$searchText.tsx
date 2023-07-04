import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { LoaderArgs } from "@remix-run/server-runtime";
import { useEffect } from "react";

import { json } from "react-router";
import { createJob, getJobByChannelId, Job } from "~/models/job.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const { channelId, searchText } = params;
  const domain = new URL(request.url).origin;

  const job = await getJobByChannelId(channelId as string);

  if (job) {
    if (job.status === "completed") {
      // const videos = await getVideosByChannelId(channelId as string);
      // const results = await searchChannelFromDb(videos, searchText as string);
      return json({ channelId, searchText, loading: false, job: job });
    } else {
      return json({ channelId, searchText, loading: true, job: job });
    }
  } else {
    // create new job
    const job = await createJob(channelId as string);
    fetch(`${domain}/api/jobs/run/${channelId}/`);
    return json({ channelId, searchText, loading: true, job: job });
  }
};
