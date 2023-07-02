import arc from "@architect/functions";
import { createId } from "@paralleldrive/cuid2";

export type Video = {
  videoId: string;
  channelId: string;
  channelTitle: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  url: string;
};

const skToId = (sk: string): string => sk.replace(/^Video#/, "");
//const idToSk = (id: string): string => `Video#${id}`;

export const createVideo = async (video: Video): Promise<void> => {
  const db = await arc.tables();
  await db.video.put({
    pk: video.videoId,
    sk: skToId(createId()),
    ...video,
  });
};

export const getVideoByVideoId = async (
  videoId: string
): Promise<Video | undefined> => {
  const db = await arc.tables();
  const result = await db.video.query({
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": videoId },
  });
  const [record] = result.Items;
  if (record) {
    return {
      videoId: record.pk,
      channelId: record.channelId,
      channelTitle: record.channelTitle,
      title: record.title,
      description: record.description,
      publishedAt: record.publishedAt,
      thumbnailUrl: record.thumbnailUrl,
      url: record.url,
    };
  }
};

export const getVideosByChannelId = async (
  channelId: string
): Promise<Video[]> => {
  const db = await arc.tables();
  const result = await db.video.query({
    IndexName: "byChannelId",
    KeyConditionExpression: "channelId = :cId",
    ExpressionAttributeValues: {
      ":cId": channelId,
    },
  });

  return result.Items as Video[];
};
