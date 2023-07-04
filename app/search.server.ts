import { chunk } from "lodash";
import {
  getTranscript,
  processTranscript,
  searchTranscript,
  TextMatch,
} from "./transcript.server";
import {
  createVideo,
  Video as DbVideo,
  getVideoByVideoId as getVideoByVideoIdDb,
  getVideosByChannelId as getVideosByChannelIdDb,
} from "./models/video.server";
import {
  getChannelIdFromUrl,
  getChannelVideoCount,
  getChannelVideos,
  getVideoById,
  Video,
} from "./youtube.server";
import { getTranscriptS3, getVideoS3Key, uploadFile } from "./s3.server";
import { TranscriptResponse } from "youtube-transcript";

export async function searchVideo(videoId: string, searchText: string) {
  try {
    const videoDb = await getVideoByVideoIdDb(videoId);

    let video: Video, transcript: TranscriptResponse[];
    if (videoDb) {
      transcript = await getTranscriptS3(videoId);
      video = {
        id: videoDb.videoId,
        ...videoDb,
      };
    } else {
      video = await getVideoById(videoId);
      transcript = await getTranscript(videoId);

      const saveTranscript = uploadFile(
        Buffer.from(JSON.stringify(transcript)),
        getVideoS3Key(videoId)
      );
      const saveVideoObj = createVideo({
        videoId,
        title: video.title,
        description: video.description,
        publishedAt: video.publishedAt,
        url: video.url,
        channelId: video.channelId,
        channelTitle: video.channelTitle,
        thumbnailUrl: video.thumbnailUrl,
      });
      await Promise.all([saveTranscript, saveVideoObj]);
    }

    console.log(videoDb ? "from db" : "from youtube");
    const { segments, fullText } = processTranscript(transcript);
    const matches = searchTranscript(fullText, segments, searchText);
    return { matches, video };
  } catch (e) {
    console.log(e);
    return { matches: [], video: null };
  }
}

export async function searchChannel(channelUrl: string, searchText: string) {
  let results: { video: Video; matches: TextMatch[] }[] = [];
  const channelName = await getChannelIdFromUrl(channelUrl);

  console.log({ channelName });

  const [channelVideosDb, videoCount] = await Promise.all([
    getVideosByChannelIdDb(channelName as string),
    getChannelVideoCount(channelName as string),
  ]);

  const haveMostVideos = channelVideosDb.length > videoCount * 0.8;

  if (haveMostVideos) {
    // map videos to transcript files from S3 and return matches
    results = await searchChannelFromDb(channelVideosDb, searchText);
  } else {
    // get videos from youtube and save to db
    console.log("Getting channel videos...");
    const channelVideos = await getChannelVideos(channelName as string);
    const chunkedVideos = chunk(channelVideos, 100);
    console.log(channelVideos.length + " videos found");

    console.log("Getting and processing transcripts...");

    let index = 0;
    results = [];
    for (const videoChunk of chunkedVideos) {
      const promises = videoChunk.map(async (video) => {
        try {
          const transcript = await getTranscript(video.id);
          const { segments, fullText } = processTranscript(transcript);
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
          results.push({
            video,
            matches: searchTranscript(fullText, segments, searchText),
          });
        } catch (e) {
          console.log(e);
        }
      });
      console.log("Waiting for chunk " + index + " to finish...");
      await Promise.all(promises);
      index++;
    }
  }
  console.log(channelVideosDb.length > 0 ? "from db" : "from youtube");
  return results.filter((r) => r.matches.length > 0);
}

export async function searchChannelFromDb(
  channelVideosDb: DbVideo[],
  searchText: string
) {
  let results: { video: Video; matches: TextMatch[] }[] = [];
  const chunkedVideos = chunk(channelVideosDb, 100);

  for (const videoChunk of chunkedVideos) {
    const promises = videoChunk.map(async (video) => {
      try {
        const transcript = await getTranscriptS3OrYt(video.videoId);
        const { segments, fullText } = processTranscript(transcript);
        return {
          video: {
            id: video.videoId,
            ...video,
          },
          matches: searchTranscript(fullText, segments, searchText),
        };
      } catch (e) {
        console.log(e);
        return {
          video: {
            id: video.videoId,
            ...video,
          },
          matches: [],
        };
      }
    });
    results = results.concat(await Promise.all(promises));
  }
  return results.filter((r) => r.matches.length > 0);
}

// get transcript from s3. if not found, get from youtube and save to s3
export async function getTranscriptS3OrYt(videoId: string) {
  try {
    return await getTranscriptS3(videoId);
  } catch (e) {
    const transcript = await getTranscript(videoId);
    await uploadFile(
      Buffer.from(JSON.stringify(transcript)),
      getVideoS3Key(videoId)
    );
    return transcript;
  }
}
