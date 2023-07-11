import {
  Channel,
  createChannel,
  getChannelByChannelId,
  incrementNumVideosProcessed,
} from "~/models/channel.server";
import {
  getJobByChannelId,
  updateJobStatus,
  incrementNumProccessed,
} from "~/models/job.server";
import {
  getChannelData,
  getChannelVideoCount,
  getChannelVideosGen,
  Video,
} from "~/youtube.server";
import {
  createVideo,
  getVideosByChannelId as getVideosByChannelIdDb,
} from "~/models/video.server";

import { SQSEvent } from "aws-lambda";
import { getTranscript } from "~/transcript.server";
import { uploadFile, getVideoS3Key } from "~/s3.server";

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
  for await (const chunk of videoGenerator) {
    const videosToProcess: Video[] = [];
    for (const video of chunk) {
      if (existingVideoIds.includes(video.id)) {
        await processChunk(videosToProcess, channel);
        return await updateJobStatus(job.id, "completed");
      }
      videosToProcess.push(video);
    }
    await processChunk(videosToProcess, channel);
  }
  await updateJobStatus(job.id, "completed");
}

async function processChunk(videos: Video[], channel: Channel) {
  const promises = videos.map(async (video) => {
    const transcript = await getTranscript(video.id);
    const saveTranscript = uploadFile(
      Buffer.from(JSON.stringify(transcript)),
      getVideoS3Key(video.id)
    );
    const { id, ...rest } = video;
    const saveVideoObj = createVideo({ videoId: id, ...rest });
    await Promise.all([saveTranscript, saveVideoObj]);
  });
  await Promise.allSettled(promises);
  await Promise.all([
    incrementNumProccessed(channel.channelId as string, promises.length),
    incrementNumVideosProcessed(channel, promises.length),
  ]);
}
