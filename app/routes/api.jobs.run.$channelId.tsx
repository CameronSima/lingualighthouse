import { json, LoaderArgs } from "@remix-run/node";
import { chunk } from "lodash";
import { YoutubeTranscriptError } from "youtube-transcript";
import {
  createChannel,
  getChannelByChannelId,
  updateChannel,
} from "~/models/channel.server";
import {
  getJobByChannelId,
  updateJobStats,
  updateJobStatus,
} from "~/models/job.server";
import { uploadFile, getVideoS3Key } from "~/s3.server";
import { getTranscript } from "~/transcript.server";
import {
  getChannelData,
  getChannelVideoCount,
  getChannelVideos,
} from "~/youtube.server";
import {
  createVideo,
  Video as DbVideo,
  getVideosByChannelId as getVideosByChannelIdDb,
} from "../models/video.server";

// TODO: use SQS to queue jobs

export const loader = async ({ params, request }: LoaderArgs) => {
  const { channelId } = params;
  const job = await getJobByChannelId(channelId as string);

  if (!job) {
    return json({ channelId, job: null, error: "Job not found" });
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

  // check if we already have channel videos, and how many more we need to fetch
  const numVideos = await getChannelVideoCount(channelId as string);
  if (numVideos === channel.numVideosProcessed) {
    await updateJobStatus(job.id, "completed");
    return json({ channelId, job, error: null });
  }

  await updateJobStatus(job.id, "searching");

  let dbVideoIds: string[] = [];
  if (channel.numVideosProcessed > 0) {
    const dbVideos = await getVideosByChannelIdDb(channelId as string);
    dbVideoIds = dbVideos.map((v) => v.videoId);
  }
  const channelVideos = await getChannelVideos(channelId as string);
  const chunkedVideos = chunk(channelVideos, 100);

  await updateJobStatus(job.id, "processing");

  let index = 0;
  let numNoTranscript = 0;
  let numProcessed = 0;
  let numCreated = 0;
  for (const chunk of chunkedVideos) {
    const promises = chunk.map(async (video) => {
      try {
        if (dbVideoIds.includes(video.id)) return;

        const transcript = await getTranscript(video.id);
        const saveTranscript = uploadFile(
          Buffer.from(JSON.stringify(transcript)),
          getVideoS3Key(video.id)
        );
        const saveVideoObj = createVideo({
          videoId: video.id,
          title: video.title,
          description: video.description,
          publishedAt: video.publishedAt,
          url: video.url,
          channelId: video.channelId,
          channelTitle: video.channelTitle,
          thumbnailUrl: video.thumbnailUrl,
        });
        await Promise.all([saveTranscript, saveVideoObj]);
        numCreated++;
      } catch (e) {
        console.log(e);

        numNoTranscript++;
      } finally {
        numProcessed++;
      }
    });
    console.log("Waiting for chunk " + index + " to finish...");
    await Promise.allSettled(promises);
    index++;
    await updateJobStats(job.id, numProcessed, numCreated, numNoTranscript);
  }
  console.log({ numProcessed, numCreated, numNoTranscript });
  console.log({ channel });

  await updateChannel({
    ...channel,
    numVideosProcessed: numProcessed,
  });
  await updateJobStatus(job.id, "completed");
  return json({ channelId, job, error: null });
};
