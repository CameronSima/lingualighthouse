import arc from "@architect/functions";
import { LoaderArgs } from "@remix-run/server-runtime";

import { json } from "react-router";
import { createJob, getJobByChannelId } from "~/models/job.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const { channelId, searchText } = params;
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
    //fetch(`${domain}/api/jobs/run/${channelId}/`);

    // send job to sqs
    await arc.queues.publish({
      name: "jobHandler",
      payload: { channelId },
    });
    //console.log("Success", data);
    return json({ channelId, searchText, loading: true, job: job });
  }
};
