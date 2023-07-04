import arc from "@architect/functions";
import { createId } from "@paralleldrive/cuid2";

export type Channel = {
  id: string;
  channelId: string;
  title: string;
  description: string;
  publishedAt: string;
  numVideosProcessed: number;
  thumbnailUrl: string;
  url: string;
};

const skToId = (sk: string): string => sk.replace(/^Channel#/, "");
//const idToSk = (id: string): string => `Channel#${id}`;

export const createChannel = async (channel: Omit<Channel, "id">) => {
  const db = await arc.tables();
  const id = createId();
  const result = await db.channel.put({
    pk: channel.channelId,
    sk: id,
    id,
    ...channel,
  });
  return result as Channel;
};

export const updateChannel = async (channel: Channel) => {
  const db = await arc.tables();
  const result = await db.channel.update({
    Key: {
      pk: channel.channelId,
      sk: channel.id,
    },
    UpdateExpression: `
      SET
        #title = :title,
        #description = :description,  
        #publishedAt = :publishedAt,
        #numVideosProcessed = :numVideosProcessed,
        #thumbnailUrl = :thumbnailUrl,
        #url = :url
    `,
    ExpressionAttributeNames: {
      "#title": "title",
      "#description": "description",
      "#publishedAt": "publishedAt",
      "#numVideosProcessed": "numVideosProcessed",
      "#thumbnailUrl": "thumbnailUrl",
      "#url": "url",
    },
    ExpressionAttributeValues: {
      ":title": channel.title,
      ":description": channel.description,
      ":publishedAt": channel.publishedAt,
      ":numVideosProcessed": channel.numVideosProcessed,
      ":thumbnailUrl": channel.thumbnailUrl,
      ":url": channel.url,
    },
  });
  return result as Channel;
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
      numVideosProcessed: record.numVideosProcessed,
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
    numVideosProcessed: record.numVideosProcessed,
    thumbnailUrl: record.thumbnailUrl,
    url: record.url,
  }));
};
