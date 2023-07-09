import arc from "@architect/functions";
import { createChannel, getChannelByChannelId } from "~/models/channel.server";
import {
  getJobByChannelId,
  updateJobStatus,
  updateNumToProcess,
} from "~/models/job.server";
import {
  getChannelData,
  getChannelVideoCount,
  getChannelVideosGen,
  Video,
} from "~/youtube.server";
import { getVideosByChannelId as getVideosByChannelIdDb } from "~/models/video.server";

import { SQSEvent } from "aws-lambda";

export async function handler(body: SQSEvent) {
  for (const record of body.Records) {
    const { channelId } = JSON.parse(record.body);
    try {
      await handleJob(channelId);
    } catch (error) {
      console.error(error);
    }
  }
}

async function handleJob(channelId: string) {
  const job = await getJobByChannelId(channelId as string);

  if (!job) {
    throw Error("Job not found");
  }

  if (job.status === "completed") {
    return;
  }

  await updateJobStatus(job.id, "initializing");

  let channel = await getChannelByChannelId(channelId as string);

  if (!channel) {
    const channelData = await getChannelData(channelId as string);
    channel = await createChannel({
      ...channelData,
      numVideosProcessed: 0,
    });
  }

  await updateJobStatus(job.id, "searching");

  // check if we already have channel videos, and how many more we need to fetch
  // check against channel.numVideosProcessed instead of total number of videos,
  // because numVideosProcessed includes videos that don't have a transcript
  const numVideos = await getChannelVideoCount(channelId as string);
  console.log({ numVideos }, channel.numVideosProcessed);
  if (numVideos === channel.numVideosProcessed) {
    return await updateJobStatus(job.id, "completed");
  }

  const existingVideoIds = await (
    await getVideosByChannelIdDb(channelId as string)
  ).map((v) => v.videoId);

  await updateJobStatus(job.id, "processing");

  const videoGenerator = getChannelVideosGen(channelId as string);

  // videos are returned in reverse chronological order.
  // once we see a video we already have, we can stop
  // the generator
  const videosToProcess: Video[] = [];

  for await (const chunk of videoGenerator) {
    for (const video of chunk) {
      if (existingVideoIds.includes(video.id)) {
        if (videosToProcess.length > 0) {
          return await sendJobToQueue(channelId as string, videosToProcess);
        } else {
          return updateJobStatus(job.id, "completed");
        }
      } else {
        videosToProcess.push(video);
      }
    }
  }
  return await sendJobToQueue(channelId as string, videosToProcess);
}

async function sendJobToQueue(channelId: string, videos: Video[]) {
  console.log(`Sending ${videos.length} videos to queue`);
  await updateNumToProcess(channelId, videos.length);

  const promises = videos.map(async (video) => {
    return await arc.queues.publish({
      name: "videoHandler",
      payload: { channelId, video },
    });
  });

  await Promise.all(promises);
}
