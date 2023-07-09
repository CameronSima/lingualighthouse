import { SQSEvent } from "aws-lambda";
import { incrementNumVideosProcessed as incrementChannel } from "~/models/channel.server";
import {
  incrementNumProccessed as incrementJob,
  updateJobStatus,
} from "~/models/job.server";
import { createVideo } from "~/models/video.server";
import { uploadFile, getVideoS3Key } from "~/s3.server";
import { getTranscript } from "~/transcript.server";
import { Video } from "~/youtube.server";

export async function handler(event: SQSEvent) {
  const promises = event.Records.map(async (record) => {
    const {
      video,
      channelId,
    }: { video: Video; channelId: string; jobId: string } = JSON.parse(
      record.body
    );

    try {
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
    } catch (error) {
      console.error(error);
    } finally {
      const job = await incrementJob(channelId, 1);
      if (!job) {
        throw Error("Job not found");
      }
      if (job.numVideosProcessed === job.numVideosToProcess) {
        await updateJobStatus(channelId, "completed");
      }
      await incrementChannel(channelId, 1);
    }
    return;
  });

  //console.log("num promises ", promises.length);
  // get number of resolved promises
  await Promise.allSettled(promises);

  // const numResolved = resolved.filter((r) => r.status === "fulfilled").length;
  // const numRejected = resolved.filter((r) => r.status === "rejected").length;
  //   console.log(`Resolved ${numResolved} videos`);
  //   console.log(`Rejected ${numRejected} videos`);
}
