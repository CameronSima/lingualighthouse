import arc from "@architect/functions";
import { createId } from "@paralleldrive/cuid2";

export type Channel = {
  id: string;
  channelId: string;
  title: string;
  description: string;
  publishedAt: string;
  numVideos: number;
  numVideoWithTranscript: number;
  thumbnailUrl: string;
  url: string;
};

const skToId = (sk: string): string => sk.replace(/^Channel#/, "");
//const idToSk = (id: string): string => `Channel#${id}`;

export const createChannel = async (channel: Channel): Promise<void> => {
  const db = await arc.tables();
  await db.channel.put({
    pk: channel.id,
    sk: skToId(createId()),
    ...channel,
  });
};

export const getChannelByChannelId = async (
  channelId: string
): Promise<Channel | undefined> => {
  const db = await arc.tables();
  const result = await db.channel.query({
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": channelId },
  });
  const [record] = result.Items;
  if (record) {
    return {
      id: record.pk,
      channelId: record.channelId,
      title: record.title,
      description: record.description,
      publishedAt: record.publishedAt,
      numVideos: record.numVideos,
      numVideoWithTranscript: record.numVideoWithTranscript,
      thumbnailUrl: record.thumbnailUrl,
      url: record.url,
    };
  }
};

export const getChannels = async (): Promise<Channel[]> => {
  const db = await arc.tables();
  const result = await db.channel.scan({});
  return result.Items.map((record) => ({
    id: record.pk,
    channelId: record.channelId,
    title: record.title,
    description: record.description,
    publishedAt: record.publishedAt,
    numVideos: record.numVideos,
    numVideoWithTranscript: record.numVideoWithTranscript,
    thumbnailUrl: record.thumbnailUrl,
    url: record.url,
  }));
};
