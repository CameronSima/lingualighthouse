import arc from "@architect/functions";
import { createId } from "@paralleldrive/cuid2";

export type JobStatus =
  | "pending"
  | "initializing"
  | "searching"
  | "processing"
  | "completed"
  | "failed";

export type Job = {
  id: string;
  channelId: string;
  status: JobStatus;
  numVideosFound: number;
  numVideosProcessed: number;
  numVideosFailed: number;

  // expiration is the mechanism to recheck channels for new videos
  TTL: number;
};

const skToId = (sk: string): string => sk.replace(/^Job#/, "");
//const idToSk = (id: string): string => `Job#${id}`;

export const createJob = async (channelId: string) => {
  const db = await arc.tables();
  const result = await db.job.put({
    pk: channelId,
    id: createId(),
    status: "pending",
    // expire in 1 day
    TTL: Math.floor(Date.now() / 1000) + 60 * 60 * 24,

    numVideosFound: 0,
    numVideosProcessed: 0,
    numVideosFailed: 0,
  });
  return result as Job;
};

export const getJobByChannelId = async (
  channelId: string
): Promise<Job | undefined> => {
  const db = await arc.tables();
  const result = await db.job.query({
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": channelId },
  });
  const [record] = result.Items;
  if (record) {
    return {
      id: record.pk,
      channelId: record.channelId,
      status: record.status,
      numVideosFound: record.numVideosFound,
      numVideosProcessed: record.numVideosProcessed,
      numVideosFailed: record.numVideosFailed,
      TTL: record.TTL,
    };
  }
};

export const updateJobStatus = async (
  channelId: string,
  status: JobStatus
): Promise<void> => {
  const db = await arc.tables();
  await db.job.update({
    Key: { pk: channelId },
    UpdateExpression: "set #status = :status",
    ExpressionAttributeNames: { "#status": "status" },
    ExpressionAttributeValues: { ":status": status },
  });
};

export const updateJobStats = async (
  channelId: string,
  numVideosFound: number,
  numVideosProcessed: number,
  numVideosFailed: number
): Promise<void> => {
  const db = await arc.tables();
  await db.job.update({
    Key: { pk: channelId },
    UpdateExpression:
      "set #numVideosFound = :numVideosFound, #numVideosProcessed = :numVideosProcessed, #numVideosFailed = :numVideosFailed",
    ExpressionAttributeNames: {
      "#numVideosFound": "numVideosFound",
      "#numVideosProcessed": "numVideosProcessed",
      "#numVideosFailed": "numVideosFailed",
    },
    ExpressionAttributeValues: {
      ":numVideosFound": numVideosFound,
      ":numVideosProcessed": numVideosProcessed,
      ":numVideosFailed": numVideosFailed,
    },
  });
};
